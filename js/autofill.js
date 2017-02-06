'use strict'

//TODO: eventually this module should use a fuzzy search and show an autocomplete list.

//Chrome has rudimentary datalist element support, but it sucks, so we need our own implementation

module.exports = {prevent, fill, processNode}

let isPrevented = false

function prevent () {
  isPrevented = true
}

function fill (node) {
  if (isPrevented) {
    isPrevented = false
  } else {
    processNode(node)
  }
}

function processNode (node) {
  const textNode = node.childNodes[0]
  const text = node.innerText
  let autoFillValues = []
  let autoFilledText

  if (node.tagName === 'TAG') {
    autoFillValues = tags
  } else {
    //TODO: add autofill for props based on tag and values based on prop
    return //cancel autofill if we're not in a node where there's something to autofill
  }

  //If we have an exact match, don't bother with autofill, it's all good
  if (!autoFillValues[text]) {
    autoFilledText = autoFillValues.find((item)=>{
      return item.indexOf(text) === 0
    })

    if (autoFilledText) {
      const selStart = text.length
      const selEnd = autoFilledText.length
      node.innerText = autoFilledText
      const range = document.createRange();
      range.setStart(textNode, selStart);
      range.setEnd(textNode, selEnd);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

function cycle() {
  //TODO: up/down arrows should advance autofill to the prev/next match, so you can type 'ar' and get 'area', then 'article'
}

