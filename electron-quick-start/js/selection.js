'use strict'

let col = 0


function select(to, opts) {
  opts = opts || ''
  //If not additive, remove sel class from everything that not cursor
  if (opts.includes(':add')) {
  } else {
    $('.sel:not(.cur)').removeClass('sel')
  }
  if (opts.includes(':children')) {
    to = to.add(getRowChildren(to.parent('row')).children(':first-child'))
  }
  to.addClass('sel')
  $('.hilite').removeClass('hilite')
  $('tag.sel, txt.sel').parent().addClass('hilite')
}


function selTarget (e, opts) {
  opts = opts || ''
  if (e && e.preventDefault) {e.preventDefault()}

  let cursors = $('.cur')
  let target = $(e.target)
  let newCur = $()

  if (target.parent('row').length) {
    newCur = target
  } else if (e.target.tagName === 'ROW') {
    //Select row and its children when clicking row. Not sure this is the right thing to do, but at least there's some way to select all children.
    opts += ':children'
    newCur = target.children().first()
  } else {
    newCur = $('doc').children().last().children().last()
  }

  if (e.shiftKey) {opts += ':add'} //TODO: Shift should select a range, cmd should drop multiple cursors?
  if (!e.altKey) {cursors.removeClass('cur')} //You can drop multiple cursors by pressing alt
  newCur.addClass('cur')
  select(newCur, opts)
}


//Select up/down, additive selects up/down by nearest col it finds
function selRow (e, act) {
  if (e && e.preventDefault) {e.preventDefault()}
  if (e.shiftKey) {act += ':add'}
  if (e.metaKey) {act += ':end'}
  let cursors = $('.cur')
  let cursor = cursors.first()
  let newCurs = $()

  //Track column based on the first cursor, because multiple cursors always collapse to the first cursor
  //TODO: if there's only one cursor, use col to track farthest right position like text editors do. I could do that for every cursor by making col into an array, but not sure that's the right thing to do.
  col = Math.max(col, cursor.parent().children().index(cursor))

  let up = act.includes('up')
  let down = act.includes('down')

  //TODO: add simple cases for up & down if there's no selection. The app should take care that there's always some element selected, but might be good to have just in case


  cursors.each(function(index, el) {
    let cursor = $(el)
    let row = cursor.parent()
    let props = row.children()
    let cursorCol = props.index(cursor)
    let newRow
    let newCur
    if (up) {newRow = row.prevAll(':not(.hidden)').first()} //Skip children of folded rows
    if (down) {newRow = row.nextAll(':not(.hidden)').first()}
    let newProps = props
    if (newRow.length) {newProps = newRow.children()}
    if (newProps.length - 1 >= cursorCol) { //Because col is zero based, ugh
      newCur = newProps.eq(cursorCol)
      newCurs = newCurs.add(newCur)
    } else if (newProps.length > 0) {
      newCur = newProps.first()
      newCurs = newCurs.add(newCur)
    }
  })

  cursors.removeClass('cur')
  newCurs.addClass('cur')
  select(newCurs, act)
}


function selCol (e, act) {
  if (e && e.preventDefault) {e.preventDefault()}
  if (e.shiftKey) {act += ':add'}
  if (e.metaKey) {act += ':end'} //TODO: implement end, move cursor to end/start of row and select everything from old cursor to new cursor pos
  let cursors = $('.cur')
  let cursor = $('cur').first()
  let newCurs = $()

  //Track column based on the first cursor, because multiple cursors always collapse to the first cursor
  col = cursor.parent().children().index(cursor)

  let left = act.includes('left')
  let right = act.includes('right')

  //TODO: add simple cases for left & right if there's no selection. The app actions should really always result in a selection, and the first tag should be selected on document open, but it might be good to have just in case

  cursors.each(function(index, el) {
    let cursor = $(el)
    let newCur
    if (left) {newCur = cursor.prev()}
    if (right) {newCur = cursor.next()}
    // if (!newCur.length) {
    //   if (left) {newCur = cursor.parent().prev().children().last()}
    //   if (right) {newCur = cursor.parent().next().children().first()}
    // } //Commented out because keeping sideways selection on the same row is simpler to understand and less finicky for the user
    if (!newCur.length) {
      newCur = cursor
    }
    newCurs = newCurs.add(newCur)
  })

  cursors.removeClass('cur')
  newCurs.addClass('cur')
  select(newCurs, act)
}


function selEscape (e) {
  if (e && e.preventDefault) {e.preventDefault()}
  let cursors = $('.cur')
  let cursor = cursors.first()
  let newCur

  if (cursors.length > 1) {
    //Collapse multiple cursors
    newCur = cursor
  } else if (['PROP', 'VAL'].includes(cursor[0].tagName)) {
    //If cursor is not on beginning of row (tag), move it there
    newCur = cursor.parent().children().first()
  } else {
    //Select row prev until indent is less than current
    let row = cursor.parent()
    let tabs = Math.max(0, parseInt(row.attr('tabs')) - 1) //Max with 0 so tabs can't go negative
    let prevs = row.prevAll(`[tabs="${tabs}"]`)
    if (prevs.length) {
      newCur = prevs.first().children().first()
    } else {
      newCur = cursor
    }
  }

  cursors.removeClass('cur')
  newCur.addClass('cur')
  select(newCur)
}


function selSimilar(e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  opts = opts || ''
  let cursor = $('.cur').last()
  let text = cursor.attr('text')
  let similars = $(`[text="${text}"]`)
  let newCur
  if (opts.includes(':all')) {
    newCur = similars
  } else {
    //Find cursor among similars and get next
    let index = similars.index(cursor) + 1
    newCur = similars.eq(index)
    if (!newCur.length) {
      //If there's no next, start searching from the beginning of the document
      newCur = $(`[text="${text}"]:not(.cur)`).first()
    }
  }
  newCur.addClass('cur')
  select(newCur)
}


function getRowChildren(node) {
  //Finds rows that are more indented than the given row, until encounters a row with the same indentation or less. Does not select anything by itself, more of a utility function.
  let row = $(node)
  let tabs = parseInt(row.attr('tabs'))
  let children = $()
  row.nextAll().each((i, el)=>{
    let childTabs = parseInt($(el).attr('tabs'))
    if (childTabs > tabs) {
      //TODO: drag-drop flattens tabs. so after a drag operation, this will no longer find .hidden elements that are after a .folded element. Need to do some sort of smart tab handling there
      children = children.add(el)
    } else {
      return false
    }
  })
  return children
}

