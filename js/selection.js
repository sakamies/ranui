'use strict'

let col = 0

//TODO: alt should globally be an "add cursor" modifier and shift should be "add to selection" modifier, do this at selection functions instead of in key handling so it'll apply to mouse & keyboard

function select(to, opts) {

  opts = opts || ''
  //If selection is not additive, remove sel class from everything that's not cursor
  if (opts.includes(':add')) {
  } else {
    $('.sel:not(.cur)').removeClass('sel')
  }
  if (opts.includes(':children')) {
    to = to.add(getRowChildren(to.parent('row')).children(':first-child'))
  }
  to.addClass('sel')

  //Tag & txt props are proxies for their row, so when they are selected, highlight entire row
  $('.hilite').removeClass('hilite')
  $('tag.sel, txt.sel').parent().addClass('hilite')

  //When you select a folded row, all its children need to be selected too, so tabbing, moving, dragging etc work like they're supposed to. Chould use `select(to, ':children:add')` here, but if the indentation is not pristine, that could produce the wrong result.
  $('.hilite.folded')
    .nextUntil(':not(.hidden)').addClass('hilite')
    .children('tag, txt').addClass('sel')

  //TODO: check that any functions that modify or select stuff use this function to set selection (instead of modifying `.sel` classes directly), so I can be sure that hidden rows are always selected if the folded row is selected
  //TODO: all edit operations need to be aware of hidden rows for folding to work, maybe I should disable folding for a while until I get a handle on how it should work
  //TODO: createRow either unfold a row just before adding a row, or only create siblings for folded rows.
  //TODO: I could handle all these cases if I had a generic function to get an element reference, so when doing move operations etc, I'd get the folded row and its children and move the whole bunch

}


function selTarget (e, opts) {
  //This is only invovek from mouse events for now, so this can assume e is a real mouse event

  opts = opts || ''
  if (e && e.preventDefault) {e.preventDefault()}

  let cursors = $('.cur')
  let target = $(e.target)
  let newCur = $()

  if (target.parent('row').length) {
    newCur = target
  } else if (e.target.tagName === 'ROW') {
    newCur = target.children().first()
    if (e.layerX < newCur.position().left) {
      //TODO: clicking near a vertical line that shows indentation depth should select the row where that vertical line originates from, and that rows children. Select children of row if you click on the left side of the tag. This should extend all the way down for the whole element, but row level is fine for now.
      console.log(e)
      opts += ':children'
    }
  } else {
    newCur = $('doc').children().last().children().last()
  }

  if (e.shiftKey) {opts += ':add'} //TODO: Shift should select a range and Cmd should toggle selection on individual rows?
  //TODO: move modkey checking and option adding from here to event listeners, so shift+click runs selTarget(e, ':add')
  if (!e.altKey) {cursors.removeClass('cur')} //You can drop multiple cursors by pressing alt
  newCur.addClass('cur')
  select(newCur, opts)
}


//Select up/down, additive selects up/down by nearest col it finds
function selRow (e, act) {
  if (e && e.preventDefault) {e.preventDefault()}
  if (e.metaKey) {act += ':end'}
  let cursors = $('.cur')
  let cursor = cursors.first()
  let newCurs = $()

  //Track column based on the first cursor, because multiple cursors always collapse to the first cursor
  //TODO: if there's only one cursor, use col to track farthest right position like text editors do. I could do that for every cursor by making col into an array, but not sure that's the right thing to do.
  col = Math.max(col, cursor.parent().children().index(cursor))

  let up = act.includes('up')
  let down = act.includes('down')
  let end = act.includes('end') //TODO: implement end

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
    if (act.includes(':add')) {
      //Additive up & down selection selects only rows, so clear selection on row and select first prop
      row.find('.sel').removeClass('sel')
      row.find('tag, txt').addClass('sel')
      newCur = newProps.first()
    } else if (newProps.length - 1 >= cursorCol) { //Because col is zero based, ugh
      newCur = newProps.eq(cursorCol)
    } else if (newProps.length > 0) {
      newCur = newProps.first()
    }
    newCurs = newCurs.add(newCur)
  })
  cursors.removeClass('cur')
  newCurs.addClass('cur')
  select(newCurs, act) //Pass options to select functions, actual additive selection happens there
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

    //Move selection from row to row when reaching the end or start of the row
    //Commented out because keeping sideways selection on the same row is simpler to understand and less finicky for the user
    // if (!newCur.length) {
    //   if (left) {newCur = cursor.parent().prev().children().last()}
    //   if (right) {newCur = cursor.parent().next().children().first()}
    // }

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


function selAll(e) {
  //Should this select the whole row first and only after that the whole doc?
  $('.cur').removeClass('cur')
  $('doc row:last :last-child').addClass('cur')
  select($('tag, prop, val, txt'))
}

