'use strict'

const {ipcRenderer} = require('electron')
const devtron = require('devtron') //DEBUG, remove for compiled app
devtron.install()

const autofill = require.main.require('./js/autofill.js')
const tags = require.main.require('./js/tags.js') //list of html tags
const parseHTML = require.main.require('./js/parseHTML.js')
const render = require.main.require('./js/render.js')
const exportHTML = require.main.require('./js/exportHTML.js')
const history = new History()
var scope = ''

//ranui.js is in global scope, so anything required here will be available through all main scripts. Yeah, should be encapsulated and all that.


//I could do most of the editing inputs via OS level menus and their accelerators. Menu items can be hidden, so maybe some menu items wouldn't need to be visible. Most of the could be in the menus too for discoverability and so you could overwrite the shortcuts easier without making custom app level configs.


window.addEventListener('keydown', keydown)
window.addEventListener('input', e=>{
  if (scope === 'editing') {
    input(e.target)
  }
})
window.addEventListener('blur', e=>{
  if (scope === 'editing') {
    commitEdit(e)
  }
})

//Copy & paste
//TODO: copypaste events seem to work great. Implement functions for setting/getting data and data parsing via http://electron.atom.io/docs/api/clipboard
window.addEventListener('beforecut', ()=>console.log('beforecut'))
window.addEventListener('beforecopy', ()=>console.log('beforecopy'))
window.addEventListener('cut', ()=>console.log('cut'))
window.addEventListener('copy', ()=>console.log('copy'))
window.addEventListener('paste', paste)


//Mouse
window.addEventListener('dblclick', e=>{history.update();startEdit(e)})
window.addEventListener('mousedown', e=>mouseDown(e))
window.addEventListener('mousemove', throttle(mouseMove, 16)) //Only running mousemove at max 60fps
window.addEventListener('mouseup', e=>mouseUp(e))


//Undo Redo
ipcRenderer.on('undo', history.undo)
ipcRenderer.on('redo', history.redo)


//Files
ipcRenderer.on('new', e=>{})
ipcRenderer.on('open', e=>{})
ipcRenderer.on('save', e=>{})
ipcRenderer.on('saveAs', e=>{})
window.addEventListener('beforeunload', e=>{
  if (history.modified()) {
    //confirm('Save changes?') //TODO: show proper [don't save / cancel / save] dialog
  }
})
