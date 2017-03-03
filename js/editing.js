'use strict'

//All these functions work for any combination of selections that have rows or props. Editing is not limited to any kind of props/rows modes, but should be able handle anything. If we want to limit editing to rows at a time or props at a time, selections should be limited to props or rows at a time.


let editmodeStartValue = null //The value of a tag/prop/val/txt needs to be shared so i can check if the value has changed between entering edit mode and committing the edit.


function startEdit (e, opts) {
  if (e && e.preventDefault) {e.preventDefault()}

  //startEdit could be called from many contexts, so it doen't itself have history.update, history.update needs to be called before invoking startEdit if needed

  //TODO: startEdit should probably collapse selection to cursors

  scope = 'editing'
  opts = opts || ''

  let cur = $('.cur')
  let target = cur.first()
  let clones = cur.not(target)
  editmodeStartValue = target.text()
  select(cur)
  $('.hilite').removeClass('hilite') //Remove row hilite so editing a tag & txt looks more explicit
  clones.addClass('clone')
  target.attr('contenteditable', 'true').focus()

  if (opts.includes(':selectEnd')) {
    target.selectEnd()
  }
  else {
    target.selectText()
  }
}

function commitEdit () {

  let target = $('[contenteditable="true"]')
  let text = target.text()
  let clones = $('.clone')
  clones.removeClass('clone')
  target.attr('contenteditable', 'false')
  select($(target, clones)) //Re-select what was being edited to restore proper selection state, because row hilites have been removed during editing.

  scope = ''

  if (text === '') {
    del(':backward')
  }

  if (editmodeStartValue !== text) {
    history.add()
    editmodeStartValue = null
  }
}


function input (node) {
  //input() takes in a node instead of event is that it can be called from anywhere, not just from input event. So you can trigger autofill programmatically when creating tags, props & vals.
  //This function could parse input and create stuff based on that, but that logic is probably better to put in the paste handler and keyboard shortcuts.

  //Could use discard.js here to throw away any invalid characters for tags, props & vals as the user is typing them, so you could never add anything illegal in the tag. Cleanup could also happen on commitEdit?

  let cur = $('.cur')
  let clones = $('.clone')
  let tagName = node.tagName
  let text = node.innerText
  let lastChar = text.slice(-1)

  //Try autofill
  autofill.fill(node)

  //If multiple items are being edited, match their text
  text = node.innerText
  clones.text(text)
  //Update text attributes to match text content for easier selection via dom queries
  cur.attr('text', text)
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
        } else if (prevRow.attr('type') === 'txt') { //Text can't be a child of text so make a new textrow a sibling of previous textrow
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


function createProp (e, type, str) {
  if (e && e.preventDefault) {e.preventDefault()}

  history.update()

  let sel = $('.sel')
  let cursors = $('.cur')
  let action = false;

  if (cursors.length === 0) {return} //Can't add props to nonexistent selections

  //Treat each cursor individually
  cursors.each((i, el)=>{
    if (el.tagName === 'TXT') {
      //Text rows can't have props
      return
    }

    type = type || ''
    let cur = $(el)
    action = true;

    //Without options, try to automatically add the right thing
    if (type.includes(':val') || (type === '' && el.tagName === 'PROP')) {
      str = str || 'value'
      cur.after(`<val class="new">${str}</val>`)
    }
    else if (type.includes(':prop') || (type === '' && ['TAG','VAL'].includes(el.tagName))) {
      str = str || 'attr'
      cur.after(`<prop class="new">${str}</prop>`)
    }

    //id & class check if the element already has an id/class and act according to that. If there's an id, just edit the id val, if there's a class, add a class after that
    //TODO: add id & add class should act on hilited rows, not cursors, so you never get a double class added to a row if there's two or more cursors on a row
    if (type.includes(':id')) {
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
    if (type.includes(':class')) {
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

  if (action) {
    let newCurs = $('.new').removeClass('new')
    cursors.removeClass('cur')
    newCurs.addClass('cur')
    select(newCurs)
    startEdit(e)
  }
}


function del (opts) {

  history.update()

  opts = opts || ':backward'
  let sel = $('.sel')
  let cursors = $('.cur')

  let newCurs = $()
  sel.each(function(i, el) {
    let $el = $(el)
    if (el.tagName === 'TAG' || el.tagName === 'TXT') {
      if (opts.includes(':backward')) {newCurs = newCurs.add($el.parent().prev().children().first())}
      if (opts.includes(':forward')) {newCurs = newCurs.add($el.parent().next().children().first())}
    } else {
      let lastchild = $el.is(':last-child')
      if (opts.includes(':backward') || lastchild) {newCurs = newCurs.add($el.prev())}
      //Forward delete moves only on the selected row, selection does not jump to next row even if the :last prop is forward deleted, that's why there's the last-child check
      else if (opts.includes(':forward')) {newCurs = newCurs.add($el.next())}
    }
    if ($el.prev().length) {
      newCurs = newCurs.add($el)
    }
  })

  //Find tags & txt in selection and delete their parents. Those are proxies for the whole row, so rows should get deleted with them.
  sel.filter('tag, txt').parent().remove()

  //If you delete a prop, its attr will get deleted too. Not strictly necessary because you can have lonely values like <div "something"> in html, but at least chrome will parse that as an attribute that has a name of "something", so it's kinda nonsensical.
  //This is commented out because the way this should work is that you cannot have a prop selected without its value being also selected. Selecting a prop should always select its val too. The cursor will behave normally, but the selection will extend to the value(s) when the cursor hits the prop.
  //sel.filter('prop').next('val').remove();

  //Delete the rest of selected stuff
  sel.remove()

  //No need to remove cur class from anything since cursors will have been removed from dom
  //No need to filter out selected items from newCurs because they too will have been deleted, so selection will automatically collapse to the previous available props from the deleted ones
  newCurs.addClass('cur')
  select(newCurs)

  history.add()
}


function duplicate() {
  //TODO: implement duplicate
}


function tab (amount) {

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


function comment () {

  history.update()

  let sel = $('.sel')
  sel.parent().toggleClass('com')

  history.add()
}



function fold (opts) {
  //TODO: folding behaviour needs quite a bit of work all over the app, it's buggy and inconsistent with regards to other editing functions

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

  //Anything that's a hidden row as a child of a folded row will have its childrens foldings reset
  $('.hidden').removeClass('hilite folded').children().removeClass('cur sel')

}



function moveRow (act) {

  history.update()

  let up = act.includes(':up')
  let down = act.includes(':down')
  let end = act.includes(':end') //TODO: implement end

  //Move props
  let sel = $('.sel')
  sel.each(function(i, el) {
    let source = $(el)
    let row = source.parent('row:not(.hilite)')
    let target

    if (up) {
      target = row.prevUntil('[type="tag"]')
      if (target.length) {
        target = target.last().prev()
      } else {
        target = row.prev('[type="tag"]')
      }
    }
    else if (down) {
      target = row.nextUntil('[type="tag"]')
      if (target.length) {
        target = target.last().next()
      } else {
        target = row.next('[type="tag"]')
      }
    }

    target.append(source)
  })

  //Move rows
  let selrows = $('row.hilite')
  selrows.each(function(i, el) {
    let selrow = $(el)
    let source
    let target
    if (up) {
      source = selrow.prev(':not(.hilite)')
      target = source.nextUntil(':not(.hilite)').last()
      target.after(source)
    }
    else if (down) {
      source = selrow.next(':not(.hilite)')
      target = source.prevUntil(':not(.hilite)').last()
      target.before(source)
    }
  })
  //TODO: moving needs automatic tab smarts, the same as in drag & drop & cut & paste

  history.add()

}

function moveCol (act) {

  history.update()

  let left = act.includes(':left')
  let right = act.includes(':right')
  let end = act.includes(':end') //TODO: implement end

  let sel = $('.sel')
  sel.each(function(i, el) {
    if (el.tagName == 'TXT') {return}
    let prop = $(el)
    let source
    let target
    if (left) {
      source = prop.prev(':not(tag):not(.sel)')
      target = source.nextUntil(':not(.sel)').last()
      target.after(source)
    }
    else if (right) {
      source = prop.next(':not(tag):not(.sel)')
      target = source.prevUntil(':not(.sel)').last()
      target.before(source)
    }
  })


  history.add()
}


//Maybe do actions like this, so each action would conform to managing history automatically, kinda like with selections and select() function
// function action(e, function) {
//   if (e && e.preventDefault) {e.preventDefault()}
//   history.update()
//   function(e)
//   history.add()
// }
