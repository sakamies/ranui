function History(initial) {
  let index = 0
  let stack = [initial]

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

  function update() {
    let item = $('doc')[0].outerHTML
    stack[index] = item
  }

  function add() {
    let item = $('doc')[0].outerHTML
    if (item !== stack[index]) {
      index = index + 1
      stack.splice(index)
      stack.push(item)
    }
  }

  //TODO: sometimes you can undo the document into oblivion, something's wrong
  function undo () {
    if (index > 0) {
      index = index - 1
      $('doc').replaceWith(stack[index])
    }
  }

  function redo () {
    if (index < stack.length - 1) {
      index = index + 1
      $('doc').replaceWith(stack[index])
    }
  }

  return {keydown, add, update, undo, redo}
}

