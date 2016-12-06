function startEdit (e, opts) {
  opts = opts || ''
  history.update()
  HI.pushScope('editing')

  let cursor = $('.cur').first()
  cursor.attr('contenteditable', 'true').focus()
  if (opts.includes(':selectEnd')) {cursor.selectEnd()}
  else {cursor.selectText()}

  if (e && e.preventDefault) {e.preventDefault()} //startEdit can be called from anywhere, can't rely on event but might get it

}
function commitEdit() {
  $('[contenteditable]').attr('contenteditable', 'false')
  history.add()
  HI.popScope('editing')
}


function input (e) {
  //Simplefill here?
  let cursor = $('.cur').first()
  let sel = $('.sel')

  //If multiple things are selected, match their text
  sel.not(cursor).text(cursor.text())

  //Update text attributes to match text content for easier selection via dom queries
  sel.each(function(index, el) {
    let $el = $(el)
    $el.attr('text', $el.text())
  })

}


function newRow (e) {
  e.preventDefault()
  let tag
  let txt
  if (e.code === 'Space') {txt = e.txt || ' '}
  else if (modkeys(e, 'none')) {tag = e.key}

  if (txt || tag) {
    let cursors = $('.cur')
    let sel = $('.sel')
    let selrows = sel.parent()

    if (txt) {selrows.after($(`<row class="new"><txt>${txt}</txt></row>`))}
    else if (tag) {selrows.after($(`<row class="new"><tag text="${tag}">${tag}</tag></row>`))}

    let newRows = $('.new').removeClass('new')
    newRows.each(function(index, row) {
      let newRow = $(row)
      let nextTabs = newRow.next().attr('tabs') || 0
      let prevTabs = newRow.prev().attr('tabs') || 0
      newRow.attr('tabs', Math.max(nextTabs, prevTabs))
    })

    let newCurs = newRows.children()
    cursors.removeClass('cur')
    newCurs.addClass('cur')
    select(newCurs)

    if (tag) {startEdit(e, ':selectEnd')}
    if (txt) {startEdit(e)}
  }
}


function newProp(e, opts) {
  e.preventDefault()
  opts = opts || ''

  let sel = $('.sel')
  let cursors = $('.cur')
  if (opts.includes(':val')) {sel.after(`<val class="new"></val>`)}
  if (opts.includes(':prop')) {sel.after(`<prop class="new"></prop>`)}
  //if (id) {sel.after('<prop text="id">id</prop><val class="new"></val>')}
  //if (class) {sel.after('<prop text="class">class</prop><val class="new"></val>')}

  let newCurs = $('.new').removeClass('new')
  cursors.removeClass('cur')
  newCurs.addClass('cur')
  select(newCurs)

  startEdit(e)
}


function tab (e) {
  history.update() //update current history entry so selection state doesn't jump when undoing

  //Should tabbing happen only for tags?
  let amount = 1
  if (e.shiftKey) {amount = -1}
  let rows = $('.sel').parent()
  rows.each(function(index, row) {
    row = $(row)
    let tabs = Math.max(parseInt(row.attr('tabs')) + amount, 0) //So tabs don't go negative
    row.attr('tabs', tabs)
  })

  history.add() //add action result to history
}


//Maybe do actions like this, so each action would conform to managing history automatically
// function action(e, function) {
//   history.update()
//   function(e)
//   history.add()
// }
