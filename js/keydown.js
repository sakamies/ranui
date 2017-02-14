//TODO: This is so horrible to read, should make a nicer abstractions for input handling. But all input handling libs I've found have been lacking.

//TODO: some of these probably belong in app menus and need to be listened to by ipcRenderer.on('whatever', e=>{})

function keydown(e) {
  //mod returns modifier keys in exclusive form, so you don't need to do e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey, just check if only shiftKey is pressed
  let mod = modkeys(e)

  //Selection
  if (scope === '') {
    if (e.key === 'ArrowUp') {
      selRow(e, 'up')
      return
    }
    else if (e.key === 'ArrowDown') {
      selRow(e, 'down')
      return
    }
    else if (e.key === 'ArrowLeft') {
      selCol(e, 'left')
      return
    }
    else if (e.key === 'ArrowRight') {
      selCol(e,'right')
      return
    }
    else if (mod.cmd && e.key === 'a') {
      selAll(e)
      return
    }
    else if (mod.cmd && e.key === 'd') {
      selSimilar(e)
      return
    }
    else if (mod.none && e.key === 'Escape') {
      selEscape(e)
      return
    }
    else if (mod.none && e.key === '-') {
      fold(e, ':fold')
      return
    }
    else if (mod.none && e.key === '+') {
      fold(e, ':unfold')
      return
    }
  }

  //Creating stuff
  if (scope === '') {
    if (mod.none && e.key.match(/^[a-z]$/)) {
      createRow(e, ':tag')
      return
    }
    else if ((mod.none || mod.shift) && e.key.match(/^[A-Z]$/)) {
      createRow(e, ':txt')
      return
    }
    else if (mod.shift && e.key === 'Enter') {
      createRow(e, ':txt')
      return
    }
    else if (mod.cmd && e.key === 'Enter') {
      createRow(e, ':tag', 'div')
      return
    }
    else if (mod.none && e.key === ' ') {
      createProp(e)
      return
    }
    else if (mod.none && e.key === ',') {
      createProp(e, ':prop')
      return
    }
    else if (e.key === ':' || e.key === '=') {
      createProp(e, ':val')
      return
    }
    else if (mod.none && e.key === '#') {
      createProp(e, ':id')
      return
    }
    else if (mod.none && e.key === '.') {
      createProp(e, ':class')
      return
    }
  }

  //Editing while in root scope
  if (scope === '') {
    if (mod.none && e.key === 'Enter') {
      console.log('Enter: start edit')
      history.update();
      startEdit(e)
      return
    }
    else if (mod.none && e.key === 'Backspace') {
      del(e, ':backward')
      return
    }
    else if (mod.none && e.key === 'Delete') {
      del(e, ':forward')
      return
    }
    else if (mod.cmdShift && e.code === 'KeyD') { //Use KeyD so there's no confusion because of shift modifying the letter that's output
      duplicate(e)
      return
    }
    else if (mod.none && e.key === 'Tab') {
      tab(e, 1)
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      tab(e, -1)
      return
    }
    else if (e.metaKey && e.key === '/') { //Check for emetakey instead of mod function because / could come through modifiers on some key layouts, like Scandinavian ones for example.
      comment(e)
      return
    }
    //TODO: move stuff around via keyboard
    // HI.on('ctrl+up', e=>{HI.log.info('move up')})
    // HI.on('ctrl+down', e=>{HI.log.info('move up')})
    // HI.on('ctrl+left', e=>{HI.log.info('move left')})
    // HI.on('ctrl+right', e=>{HI.log.info('move right')})
  }

  //Edit actions while editing an item
  if (scope === 'editing') {
    if (mod.none && e.key === 'Enter' || e.key === 'Escape') {
      console.log('commit edit')
      commitEdit(e)
      return
    }
    else if (mod.none && e.key === 'Backspace' || e.key === 'Delete') {
      autofill.prevent()
      return
    }
    else if (mod.none && e.key === 'Tab') {
      commitEdit()
      //tab(e, 1)
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      commitEdit()
      //tab(e, -1)
      return
    }
  }

  //Drag & drop
  if (scope === 'dragging') {
    if (e.key === 'Escape') {
      cancelDrag(e)
      return
    }
  }
}
