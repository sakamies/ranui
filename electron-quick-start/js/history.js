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
    push($('doc').clone())
  }
  function update() {
    stack[index] = $('doc').clone()
  }
  //TODO: undo works like shit, find out what's wrong
  function push(content) {
    //Should take in an action and its opposite action to save memory, but for now this just stores full copies of the document, crazy I know
    index = index + 1
    stack.splice(index)
    stack.push(content)
    console.log('history push', index, stack)
  }

  function undo () {
    console.log('undo from', index, stack[index])
    index = Math.max(index - 1, 0)
    $('doc').replaceWith(stack[index])
    console.log('undo to', index, stack[index])
  }
  function redo () {
    console.log('redo')
    let stackEnd = stack.length - 1
    index = Math.min(index + 1, stackEnd)
    $('doc').replaceWith(stack[index])
  }
  return {keydown, add, update, push, undo, redo}
}

