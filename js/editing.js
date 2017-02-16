'use strict'

let editmodeStartValue = null //The value of a tag/prop/val/txt needs to be shared so i can check if the value has changed between entering edit mode and committing the edit.


function startEdit (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  scope = 'editing'
  opts = opts || ''

  $('.sel:not(.cur)').removeClass('sel')
  let target = $('.cur').first()
  editmodeStartValue = target.text()
  let clones = $('.cur').not(target)
  clones.addClass('clone')
  target.attr('contenteditable', 'true').focus()

  if (opts.includes(':selectEnd')) {
    target.selectEnd()
  }
  else {
    target.selectText()
  }
}

function commitEdit(e) {
  if (e && e.preventDefault) {e.preventDefault()}

  let target = $('[contenteditable]')
  let text = target.text()
  let clones = $('.clone')
  clones.removeClass('clone')
  target.attr('contenteditable', 'false')

  scope = ''

  if (text === '') {
    del(null, ':backward')
  }

  if (editmodeStartValue !== text) {
    history.add()
    editmodeStartValue = null
  }
}


function input (node) {
  let sel = $('.sel')
  let tagName = node.tagName
  let text = node.innerText
  let lastChar = text.slice(-1)
  let clones = $('.clone')

  //Could use discard.js here too to just throw away any invalid characters for tags, props & vals

  //Check last character of input and make actions based on it. if : or = then add new val and if , then add new prop
  //Must account for what the previous element is, this could have lots of smarts, but we'll go with something really simple for start
  //TODO: should also check if editing val and prop is class, then split to new value on space or .
  if (tagName === 'PROP' && lastChar === ':' || lastChar === '=') {
    text = text.slice(0, -1)
    node.innerText = text
    commitEdit()
    createProp(null, ':val')
    startEdit()
  } else {
    //If there's no action to be done, try autofill
    autofill.fill(node)
    text = node.innerText
  }

  //If multiple things are selected, match their text
  clones.text(text)
  //Update text attributes to match text content for easier selection via dom queries
  sel.attr('text', text)
}


function createRow (e, opts, str) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  let tag = ''
  let txt = ''
  opts = opts || ''
  str = str || ''

  if (opts.includes(':txt')) {txt = str || (e && e.key) || ' '}
  else if (opts.includes(':tag')) {tag = str || (e && e.key)}
  else {tag = 'div'}

  if (txt || tag) {
    let cursors = $('.cur')
    let sel = $('.sel')
    let selrows = cursors.parent()
    let template

    if (txt) {template = $(`<row class="new" type="txt"><txt>${txt}</txt></row>`)}
    else if (tag) {template = $(`<row class="new" type="tag"><tag text="${tag}">${tag}</tag></row>`)}

    if (selrows.length) {
      selrows.after(template)
    } else { //If there's no selection, add stuff at the end of doc
      $('doc').append(template)
    }

    let newRows = $('.new').removeClass('new')
    newRows.each(function(index, row) {
      let newRow = $(row)
      let prevRow = newRow.prev()
      let nextTabs = parseInt(newRow.next().attr('tabs')) || 0
      let prevTabs = parseInt(prevRow.attr('tabs')) || 0
      if (txt) {
        if (prevRow.attr('type') === 'tag') {
          newRow.attr('tabs', prevTabs + 1)
        } else if (prevRow.attr('type') === 'txt') { //Text can't be a child of text.
        //TODO: There should be a generic cleanup & check function instead of doing all these inline
          newRow.attr('tabs', prevTabs)
        } else {
          newRow.attr('tabs', 0)
        }
      } else if (tag) {
        newRow.attr('tabs', Math.max(nextTabs, prevTabs))
      }
    })

    let newCurs = newRows.children()
    cursors.removeClass('cur')
    newCurs.addClass('cur')
    select(newCurs)

    //If the user starts creatig a tag or a text with a letter, then don't select the whole thing so the user can just continue typing
    if ((tag && tag.length === 1) || (txt && txt !== ' ')) {
      startEdit(e, ':selectEnd')
    } else {
      //Else select the whole thing, so the user can start typing and replace whatever intial vaue we guessed into the created item
      //If the tag value was prefilled to be something, don't autofill right away,  because it messes up the selection
      startEdit(e)
      autofill.prevent()
    }

    input(document.querySelector('[contenteditable="true"]'))
  }
}


function createProp(e, opts, str) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  opts = opts || ''
  str = str || ''
  let sel = $('.sel')
  let cursors = $('.cur')

  if (cursors.length === 0) {return} //Can't add props to nonexistent selections

  //Treat each cursor individually
  cursors.each((i, el)=>{
    if (el.tagName === 'TXT') {return false} //Text rows can't have props

    let cur = $(el)

    //Without options, try to automatically add the right thing
    if (opts === '' && el.tagName === 'PROP') {opts = ':val'}
    else if (opts === '' && ['TAG','VAL'].includes(el.tagName)) {opts = ':prop'}

    if (opts.includes(':val')) {cur.after(`<val class="new">${str}</val>`)}
    if (opts.includes(':prop')) {cur.after(`<prop class="new"></prop>`)}

    //id & class check if the element already has an id/class and act according to that. If there's an id, just edit the id val, if there's a class, add a class after that
    if (opts.includes(':id')) {
      let idProp = cur.parent().find('prop[text="id"] + val')
      //TODO: first check if there's an id+val combo and add new to val if there is
      //then check if there's a lone id prop without val, if there is, add a new val for id
      //else add new id+val combo after tag
      if (idProp.length) {
        idProp.addClass('new')
      } else {
        cur.after(`<prop text="id">id</prop><val class="new">${str}</val>`)
      }
    }
    if (opts.includes(':class')) {
      //TODO: first check if there's a class + val combo
      //then check if there's a lone class
      //else add class after tag or id+val
      let prop = `<prop text="class">class</prop>`
      let val = `<val class="new">${str}</val>`
      let classProp = cur.parent().find('prop[text="class"]')
      if (classProp.length) {
        classProp.nextUntil('prop').last().after(val)
      } else {
        cur.after(prop + val)
      }
    }
  })

  let newCurs = $('.new').removeClass('new')
  cursors.removeClass('cur')
  newCurs.addClass('cur')
  select(newCurs)

  startEdit(e)
}


function del (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  //TODO: add case for when last row of doc gets deleted, maybe add append a new div to the start of the document, select it and edit it so the user will need to give a tag

  //TODO: if you delete an attribute name, it should delete related values too

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

  //Find tags & txt in selection and delete their parents. Those are proxies for the whole row, so rows should get deleted with them.
  sel.filter('tag, txt').parent().remove()

  sel.remove()

  //no need to remove cur class from anything since cursors will have been removed from dom
  //no need to filter out selected items from newCurs because they too will have been deleted, so selection will automatically collapse to the previous available props from the deleted ones
  newCurs.addClass('cur')
  select(newCurs)

  history.add()
}



function tab (e, amount) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  //Should tabbing happen only for tags?
  amount = amount || 1
  let rows = $('.sel').parent()
  rows.each(function(index, row) {
    row = $(row)
    let prevTabs = parseInt(row.prev().attr('tabs'))
    let rowTabs = parseInt(row.attr('tabs'))
    let newTabs = rowTabs + amount
    let tabs = Math.max(newTabs, 0) //So tabs don't go negative
    row.attr('tabs', tabs)
  })

  history.add()
}


function comment(e) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  //TODO: this should toggle comments on children of the row too

  let sel = $('.sel')
  sel.parent().toggleClass('com')

  history.add()
}



function fold (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  opts = opts || ''
  let sel = $('.sel')
  let rows = sel.parent()
  let fold = opts.includes(':fold')
  let unfold = opts.includes(':unfold')

  rows.each(function(i, el) {
    let row = $(el)
    let children = getRowChildren(row)

    if (fold && children.length) {
      row.addClass('folded')
      children.addClass('hidden').removeClass('folded')
    } else if (unfold && row.hasClass('folded')) {
      row.removeClass('folded')
      children.removeClass('hidden')
    }
  })

  //Reset hidden rows state to normal
  $('.hidden').removeClass('hilite folded').children().removeClass('cur sel')

}



function cut (e) {

  //TODO: cur needs to copy plain text in editing mode, no frigging rich text

  if (scope !== 'editing') {
    if (e && e.preventDefault) {e.preventDefault()}

  }
}

function copy (e) {

  //TODO: copy needs to copy plain text in editing mode, no frigging rich text

  if (scope !== 'editing') {
    if (e && e.preventDefault) {e.preventDefault()}

  }
}

function paste (e) {

  //TODO: regular paste needs to prevent contenteditable from pasting styles, or clean up html after paste

  if (scope !== 'editing') {
    history.update()

    if (e && e.preventDefault) {e.preventDefault()}

    //TODO: this needs the exact same smarts for tab handling as drag & drop

    const cur = $('.cur')
    //TODO: check for text/html data, if there's none, go for text/plain
    const clip = event.clipboardData.getData('text/plain')
    const data = parseHTML(clip)

    if (data.type === 'props') {
      //Paste in like <attr1="jotai" attr2="dingus">
      let dom = render.props(data.props)
      cur.after(dom)
    } else if (data.type === 'rows') {
      //Paste in like <div class="dsa">dsa</div>
      let dom = render.rows(data.rows)
      cur.parent().after(dom)
    }

    cur.removeClass('cur')
    let newSel = $('.new').removeClass('new')
    newSel.last().addClass('cur')
    select(newSel)

    history.add()
  }
}


//Maybe do actions like this, so each action would conform to managing history automatically, kinda like with selections and select() function
// function action(e, function) {
//   if (e && e.preventDefault) {e.preventDefault()}
//   history.update()
//   function(e)
//   history.add()
// }
