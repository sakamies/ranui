//TODO: This is so horrible to read, should make a nicer abstractions for input handling. But all input handling libs I've found have been lacking.

//TODO: some of these probably belong in app menus and need to be listened to by ipcRenderer.on('whatever', e=>{})

function keydown(e) {
  console.log(e.key, e.code)
  //mod returns modifier keys in exclusive form, so you don't need to do e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey, just check if only shiftKey is pressed
  let mod = modkeys(e)

  //Selection
  if (scope === '') {
    if (mod.none && e.key === 'ArrowUp') {
      e.preventDefault()
      selRow('up')
      return
    }
    else if (mod.none && e.key === 'ArrowDown') {
      e.preventDefault()
      selRow('down')
      return
    }
    else if (mod.none && e.key === 'ArrowLeft') {
      e.preventDefault()
      selCol('left')
      return
    }
    else if (mod.none && e.key === 'ArrowRight') {
      e.preventDefault()
      selCol('right')
      return
    }
    else if (mod.shift && e.key === 'ArrowUp') {
      e.preventDefault()
      selRow('up:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowDown') {
      e.preventDefault()
      selRow('down:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowLeft') {
      e.preventDefault()
      selCol('left:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowRight') {
      e.preventDefault()
      selCol('right:add')
      return
    }
    else if (mod.cmd && e.key === 'a') {
      e.preventDefault()
      selAll(e)
      return
    }
    else if (mod.cmd && e.key === 'd') {
      e.preventDefault()
      selSimilar(e)
      return
    }
    else if (mod.none && e.key === 'Escape') {
      e.preventDefault()
      selEscape()
      return
    }
    else if (mod.none && e.key === '-') {
      e.preventDefault()
      fold(':fold')
      return
    }
    else if (mod.none && e.key === '+') {
      e.preventDefault()
      fold(':unfold')
      return
    }
  }

  //Creating stuff
  if (scope === '') {
    if (mod.none && e.key.match(/^[a-z]$/)) {
      e.preventDefault()
      //TODO: should parse the letter here and send just that to createRow, not the whole event in these create functions
      createRow(e, ':tag')
      return
    }
    else if ((mod.none || mod.shift) && e.key.match(/^[A-Z]$/)) {
      e.preventDefault()
      createRow(e, ':txt')
      return
    }
    else if (mod.shift && e.key === 'Enter') {
      e.preventDefault()
      //TODO: shift+enter should add a line break when editing a txt
      createRow(e, ':txt')
      return
    }
    else if (mod.cmd && e.key === 'Enter') {
      e.preventDefault()
      //TODO: cmd+enter should work in any scope
      createRow(e, ':tag', 'div')
      return
    }
    else if (mod.none && e.key === ' ') {
      e.preventDefault()
      createProp(e)
      return
    }
    else if (e.key === ',') {
      e.preventDefault()
      createProp(e, ':prop')
      return
    }
    else if (e.key === ':' || e.key === '=') {
      e.preventDefault()
      createProp(e, ':val')
      return
    }
    else if (e.key === '#') {
      e.preventDefault()
      createProp(e, ':id')
      return
    }
    else if (e.key === '.') {
      e.preventDefault()
      createProp(e, ':class')
      return
    }
  }

  //Edit actions while in root scope
  if (scope === '') {
    if (mod.none && e.key === 'Enter') {
      history.update()
      e.preventDefault()
      startEdit()
      return
    }
    else if (mod.none && e.key === 'Backspace') {
      e.preventDefault()
      del(':backward')
      return
    }
    else if (mod.none && e.key === 'Delete') {
      e.preventDefault()
      del(':forward')
      return
    }
    else if (mod.cmdShift && e.code === 'KeyD') { //Use KeyD so there's no confusion because of shift modifying the letter that's output
      //TODO: implement duplicate
      e.preventDefault()
      duplicate()
      return
    }
    else if (mod.none && e.key === 'Tab') {
      e.preventDefault()
      tab(1)
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      e.preventDefault()
      tab(-1)
      return
    }
    else if (e.metaKey && e.key === '/') { //Check for emetakey instead of mod function because / could come through modifiers on some key layouts, like Scandinavian ones for example.
      e.preventDefault()
      comment()
      return
    }
    else if (mod.ctrl && e.key === 'ArrowUp') {
      e.preventDefault()
      moveRow(':up')
      return
    }
    else if (mod.ctrl && e.key === 'ArrowDown') {
      e.preventDefault()
      moveRow(':down')
      return
    }
    else if (mod.ctrl && e.key === 'ArrowLeft') {
      e.preventDefault()
      moveCol(':left')
      return
    }
    else if (mod.ctrl && e.key === 'ArrowRight') {
      e.preventDefault()
      moveCol(':right')
      return
    }
  }

  //Edit actions while editing an item
  if (scope === 'editing') {
    let target = $('[contenteditable="true"]')

    if (mod.none && e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      commitEdit()
      return
    }
    else if (mod.none && e.key === 'Backspace' || e.key === 'Delete') {
      autofill.prevent()
      return
    }
    else if (mod.none && e.key === 'Tab') {
      e.preventDefault()
      commitEdit()
      //Pressing tab to indent while editing felt way too fiddly, fought with muscle memory, so pressing tab is like autocompletion in the terminal or text editor, it just accepts whatever's in the input box.
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      e.preventDefault()
      commitEdit()
      return
    }
    //Make new props when pressing keys that make sense. Like, you'd expect that if you type `div `, that stuff after that would be an attribute name, so that's what happens. This becomes troublesome when the visualised syntax clashes with html validity. HTML allows : * and stuff in attribute names. Pressing : inside an attribute name must allow you to keep typing, because svg is a common case where you use some namespacing.
    else if (target[0].tagName === 'TAG' && e.code === 'Space') {
      e.preventDefault()
      commitEdit()
      createProp(e)
    } else if (target[0].tagName === 'PROP' && e.code === 'Space') {
      e.preventDefault()
      commitEdit()
      createProp(e)
    }
  }

  //Drag & drop
  if (scope === 'dragging') {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelDrag(e)
      return
    }
  }
}
