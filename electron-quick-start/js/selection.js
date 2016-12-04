col = 0


//Select up/down, additive selects up/down by nearest col it finds
function selRow (act) {
  //TODO: better multiple cursors, should work pretty much like sublime text
  let sel = $('.sel')
  if (act.includes(':add')) {cursor = sel}
  else if (act.includes('up')) {cursor = sel.first();}
  else if (act.includes('down')) {cursor = sel.last()}
  cursor.each(function(index, el) {
    let cursor = $(el)
    let row = cursor.parent()
    let props = row.children()
    let rowNew
    if (act.includes('up')) {rowNew = row.prev()}
    if (act.includes('down')) {rowNew = row.next()}
    let propsNew = props
    if (rowNew.length) {propsNew = rowNew.children()}
    if (!act.includes(':add')) {
      sel.removeClass('sel')
      col = Math.max(col, props.index(cursor)) //keep the farthest column
    } else {
      col = props.index(cursor)
    }
    if (propsNew.length - 1 >= col) { //Because col is zero based, ugh
      propsNew.eq(col).addClass('sel')
    } else if (propsNew.length > 0) {
      propsNew.last().addClass('sel')
    }
  })
}


function selCol (act) {
  let sel = $('.sel')
  let cursor
  if (act.includes(':add')) {cursor = sel}
  else if (act.includes('left')) {cursor = sel.first()}
  else if (act.includes('right')) {cursor = sel.last()}
  let newSel
  if (act.includes('left')) {newSel = cursor.prev()}
  if (act.includes('right')) {newSel = cursor.next()}
  if (!newSel.length) {
    if (act.includes('left')) {newSel = cursor.parent().prev().children().last()}
    if (act.includes('right')) {newSel = cursor.parent().next().children().first()}
  }
  if (!newSel.length) {
    newSel = cursor
  }
  if (!act.includes('add')) {
    sel.removeClass('sel')
    col = newSel.parent().children().index(newSel)
  }
  newSel.addClass('sel')
}


function sel (event) {
  let sel = $(event.target)
  if (sel.parent('row').length) {
    event.preventDefault()
    if (event.shiftKey) {
      $(event.target).toggleClass('sel')
    } else {
      $('.sel').removeClass('sel')
      $(event.target).addClass('sel')
    }
  }
}


function selParent (event) {
  let sel = $('.sel')
  let cursor = sel.first()
  if (sel.length > 1) {
    //Collapse multiple cursors
    sel.removeClass('sel')
    cursor.addClass('sel')
  } else if (['PROP', 'VAL'].includes(cursor[0].tagName)) {
    //Select first item in row
    sel.removeClass('sel')
    cursor.parent().children().first().addClass('sel')
  } else {
    //Select row prev until indent is less than current
    let row = cursor.parent()
    console.log(row.attr('tabs'))
    let tabs = Math.max(0, parseInt(row.attr('tabs')) - 1) //Max so tabs can't be negative
    let prevs = row.prevAll(`[tabs="${tabs}"]`)
    if (prevs.length) {
      sel.removeClass('sel')
      prevs.first().children().first().addClass('sel')
    }
  }
}
