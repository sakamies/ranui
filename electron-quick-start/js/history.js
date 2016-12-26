'use strict'

function History(initial) {
  let index = 0
  let stack = [initial]
  let isModified = false

  function modified() {
    return isModified
  }

  function update() {
    let item = $('doc')[0].outerHTML
    stack[index] = item
    isModified = true
  }

  function add() {
    let item = $('doc')[0].outerHTML
    if (item !== stack[index]) {
      index = index + 1
      stack.splice(index)
      stack.push(item)
      isModified = true
    }
  }

  //TODO: sometimes you can undo the document into oblivion, something's wrong
  function undo () {
    if (HI.scope === 'editing:') {
      document.execCommand('undo', '', null)
    } else if (index > 0) {
      index = index - 1
      $('doc').replaceWith(stack[index])
    }
  }

  function redo () {
    if (HI.scope === 'editing:') {
      document.execCommand('redo', '', null)
    } else if (index < stack.length - 1) {
      index = index + 1
      $('doc').replaceWith(stack[index])
    }
  }

  return {add, update, undo, redo, modified}
}

