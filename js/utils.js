'use strict'

//Misc utility stuff that's not directly related to editing.

jQuery.fn.selectText = function(){
  const element = this[0]
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}
jQuery.fn.selectEnd = function(){
  const element = this[0]
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(element)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}


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

  return keys;
  //if (keys[key]) {return true}
  //else {return false}
}


//create a throttled instance of a function
//throttled = throttle(handleEvent)
//use it
//addEventListener(throttled) or e=>throttled(e, arg, arg, etc)
function throttle (fn, time, scope) {
  time = time || 250
  var last
  var deferTimer

  //create a scope with throttle, then return the throttled function that has access to the throttle scope, so it can set last & timer vars
  return function () {
    let context = scope || this;

    let now = +new Date
    let args = arguments

    if (last && now < last + time) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now
        fn.apply(context, args)
      }, time)
    } else {
      last = now
      fn.apply(context, args)
    }
  };
}
