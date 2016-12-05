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


modkeys = function (e, key) {
  let keys = {
    shift: e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey,
    alt: !e.shiftKey && e.altKey && !e.ctrlKey && !e.metaKey,
    ctrl: !e.shiftKey && !e.altKey && e.ctrlKey && !e.metaKey,
    cmd: !e.shiftKey && !e.altKey && !e.ctrlKey && e.metaKey,
    any: e.shiftKey || e.altKey || e.ctrlKey || e.metaKey,
    'cmd-shift': e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey,
    'ctrl-shift': e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey,
    'ctrl-cmd': e.metaKey && e.ctrlKey && !e.altKey && !e.shiftKey,
  }
  keys.none = !keys.any
  keys['shift-cmd'] = keys['cmd-shift']
  keys['shift-ctrl'] = keys['ctrl-shift']
  keys['ctrl-cmd'] = keys['cmd-ctrl']

  if (keys[key]) {return true}
  else {return false}
}
