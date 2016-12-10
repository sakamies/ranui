let editStartValue = ''

function startEdit (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  HI.pushScope('editing')

  opts = opts || ''
  let target = $('.cur').first()
  editStartValue = target.text()
  let clones = $('.sel').not(target)
  target.attr('contenteditable', 'true').focus()
  clones.addClass('clone')

  if (opts.includes(':selectEnd')) {target.selectEnd()}
  else {target.selectText()}


}
function commitEdit(e) {
  if (e && e.preventDefault) {e.preventDefault()}

  let target = $('[contenteditable]')
  let clones = $('.clone')
  clones.removeClass('clone')
  target.attr('contenteditable', 'false')

  HI.popScope('editing')
  if (editStartValue !== target.text()) {
    history.add()
  }
}


function input (e) {
  let sel = $('.sel')
  let target = $(e.target)
  let tagName = e.target.tagName
  let text = target.text()
  let lastChar = text.slice(-1)
  let clones = $('.clone')

  //TODO: Simplefill here?

  //Check last character of input and make actions based on it. if : or = then add new val and if , then add new prop
  //Must account for what the previous element is, this could have lots of smarts, but we'll go with something really simple for start
  if (tagName === 'PROP' && lastChar === ':' || lastChar === '=') {
    text = text.slice(0, -1)
    target.text(text)
    commitEdit()
    newProp(e, ':val')
    startEdit()
  }

  //If multiple things are selected, match their text
  clones.text(text)
  //Update text attributes to match text content for easier selection via dom queries
  sel.attr('text', text)
}


function newRow (e) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  let tag
  let txt
  if (e.code === 'Space') {txt = e.txt || ' '}
  else if (modkeys(e, 'none')) {tag = e.key}

  if (txt || tag) {
    let cursors = $('.cur')
    let sel = $('.sel')
    let selrows = sel.parent()

    if (txt) {selrows.after($(`<row class="new" type="txt"><txt>${txt}</txt></row>`))}
    else if (tag) {selrows.after($(`<row class="new" type="tag"><tag text="${tag}">${tag}</tag></row>`))}

    let newRows = $('.new').removeClass('new')
    newRows.each(function(index, row) {
      let newRow = $(row)
      let prevRow = newRow.prev()
      let nextTabs = parseInt(newRow.next().attr('tabs')) || 0
      let prevTabs = parseInt(prevRow.attr('tabs')) || 0
      if (txt) {
        if (prevRow.attr('type') === 'txt') {
          newRow.attr('tabs', prevTabs)
        } else {
          newRow.attr('tabs', prevTabs + 1)
        }
      } else if (tag) {
        newRow.attr('tabs', Math.max(nextTabs, prevTabs))
      }
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
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

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


function del (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  opts = opts || ''
  let sel = $('.sel')
  let cursors = $('.cur')

  let newCurs = $()
  let deletable = $()
  sel.each(function(i, el) {
    el = $(el)
    if (['TAG', 'TXT'].includes(el[0].tagName)) {
      if (opts.includes(':backward')) {newCurs = newCurs.add(el.parent().prev().children().first())}
      if (opts.includes(':forward')) {newCurs = newCurs.add(el.parent().next().children().first())}
    } else {
      let lastchild = el.is(':last-child')
      if (opts.includes(':backward') || lastchild) {newCurs = newCurs.add(el.prev())}
      //Forward delete moves only on the selected row, selection does not jump to next row even if the :last prop is forward deleted, that's why there's the last-child check
      else if (opts.includes(':forward')) {newCurs = newCurs.add(el.next())}
    }
    if (el.prev().length) {
      newCurs = newCurs.add(el)
    }
  })

  //Delete whole row if tag or txt is to be deleted. Tag is a proxy for the whole row and txt can't include more than the text itself
  sel.filter('tag, txt').parent().remove()
  sel.remove()

  //no need to remove cur class from anything since cursors will have been removed from dom
  //no need to filter out selected items from newCurs because they too will have been deleted, so selection will automatically collapse to the previous available props from the deleted ones
  newCurs.addClass('cur')
  select(newCurs)

  history.add()
}



function tab (e) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  //Should tabbing happen only for tags?
  let amount = 1
  if (e.shiftKey) {amount = -1}
  let rows = $('.sel').parent()
  rows.each(function(index, row) {
    row = $(row)
    let prevTabs = parseInt(row.prev().attr('tabs'))
    console.log(prevTabs)
    let tabs = Math.max(parseInt(row.attr('tabs')) + amount, 0) //So tabs don't go negative
    row.attr('tabs', tabs)
  })

  history.add()
}


function comment(e) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  let sel = $('.sel')
  sel.parent().toggleClass('com')

  history.add()
}



//Maybe do actions like this, so each action would conform to managing history automatically, kinda like with selections and select() function
// function action(e, function) {
//   if (e && e.preventDefault) {e.preventDefault()}
//   history.update()
//   function(e)
//   history.add()
// }
