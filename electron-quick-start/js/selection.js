col = 0


function select(to, opts) {
  opts = opts || ''
  //If not additive, remove sel class from everything that not cursor
  if (opts.includes(':add') === false) {$('.sel:not(.cur)').removeClass('sel')}
  to.addClass('cur sel')
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
  } else if (target.parent('doc').length) {
    newCur = target.children().first()
  } else {
    newCur = $('doc').children().last().children().last()
  }

  if (e.shiftKey) {opts += ':add'}
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
  col = Math.max(col, cursor.parent().children().index(cursor))

  let up = act.includes('up')
  let down = act.includes('down')

  //TODO: add simple cases for up & down if there's no selection

  cursors.each(function(index, el) {
    let cursor = $(el)
    let row = cursor.parent()
    let props = row.children()
    let cursorCol = props.index(cursor)
    let newRow
    let newCur
    if (up) {newRow = row.prev()}
    if (down) {newRow = row.next()}
    let newProps = props
    if (newRow.length) {newProps = newRow.children()}
    //TODO: check if there's a next or prev row and don't make selection disappear if there isn't a row there
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

  //TODO: add simple cases for left & right if there's no selection

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


function selSimilar(e) {
  if (e && e.preventDefault) {e.preventDefault()}
  let cursor = $('.cur').last()
  let text = cursor.attr('text')
  let similars = $(`[text="${text}"]`)
  let index = similars.index(cursor) + 1
  let newCur = similars.eq(index)
  if (!newCur.length) {
    newCur = $(`[text="${text}"]:not(.cur)`).first()
  }
  select(newCur)
}



