function History(initial) {
  let index = -1
  let stack = [initial]
  add() //add the state of the document on init

  function keydown (e) {
    if (modkeys(e, 'cmd') && e.key === 'z') {
      e.preventDefault()
      undo()
    }
    if (modkeys(e, 'cmd-shift') && e.key === 'Z') {
      e.preventDefault()
      redo()
    }
  }

  function add() {
    //Holy crap this must be inefficient, being called twice for every edit, but works for now
    //Should take in an action and its opposite action to save memory, but for now this just stores full copies of the document, crazy I know
    let item = $('doc')[0].outerHTML
    //Don't add to undo stack if document didn't change
    if (item !== stack[stack.length - 1]) {
      console.log('add')
      push($('doc')[0].outerHTML)
    }
  }
  function update() {
    stack[index] = $('doc')[0].outerHTML
    console.log('update', index, stack.length, stack[index])
  }
  function push(item) {
    index = index + 1
    stack.splice(index)
    stack.push(item)
    console.log('push to', index, stack.length, stack[index])
  }

  function undo () {
    if (index > 0) {
      index = index - 1
      $('doc').replaceWith(stack[index])
      console.log('undo to', index, stack.length, stack[index])
    }
  }
  function redo () {
    if (index < stack.length - 1) {
      index = index + 1
      $('doc').replaceWith(stack[index])
      console.log('redo to', index, stack.length, stack[index])
    }
  }
  return {keydown, add, update, push, undo, redo}
}

