'use strict'

//Ranui utils
function getRowChildren(node) {
  //Finds rows that are more indented than the given row, until encounters a row with the same indentation or less. Does not select anything by itself, more of a utility function.
  let row = $(node)
  let tabs = parseInt(row.attr('tabs'))
  let children = $()
  row.nextAll().each((i, el)=>{
    let childTabs = parseInt($(el).attr('tabs'))
    if (childTabs > tabs) {
      children = children.add(el)
    } else {
      return false
    }
  })
  return children
}





//Misc js utility stuff that's not directly related to editing.

jQuery.fn.selectText = function(){
  const element = this[0]
  if (element) {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(element)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
jQuery.fn.selectEnd = function(){
  const element = this[0]
  if (element) {
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(element)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}



//mod returns modifier keys in exclusive form, so you don't need to do e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey, just check if only shiftKey is pressed
function modkeys (e, key) {
  let keys = {
    shift: e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey,
    alt: !e.shiftKey && e.altKey && !e.ctrlKey && !e.metaKey,
    ctrl: !e.shiftKey && !e.altKey && e.ctrlKey && !e.metaKey,
    cmd: !e.shiftKey && !e.altKey && !e.ctrlKey && e.metaKey,
    any: e.shiftKey || e.altKey || e.ctrlKey || e.metaKey,
    'cmdShift': e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey,
    'ctrlShift': e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey,
    'ctrlCmd': e.metaKey && e.ctrlKey && !e.altKey && !e.shiftKey,
  }
  keys.none = !keys.any
  keys['shiftCmd'] = keys['cmdShift']
  keys['shiftCtrl'] = keys['ctrlShift']
  keys['ctrlCmd'] = keys['cmdCtrl']

  return keys
  //if (keys[key]) {return true}
  //else {return false}
}



//create a throttled instance of a function
//throttledFunction = throttle(someFunctionHere)
//use it
//addEventListener(throttledFunction) or e=>throttled(e, arg, arg, etc)
function throttle (fn, time, scope) {
  time = time || 250
  var last
  var deferTimer

  //create a scope with throttle, then return the throttled function that has access to the throttle scope, so it can set last & timer vars
  return function () {
    let context = scope || this

    let now = +new Date
    let args = arguments

    if (last && now < last + time) {
      clearTimeout(deferTimer)
      deferTimer = setTimeout(function () {
        last = now
        fn.apply(context, args)
      }, time)
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}
