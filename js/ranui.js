'use strict'

const {ipcRenderer} = require('electron')
const devtron = require('devtron') //DEBUG, remove for compiled app
devtron.install()

const autofill = require.main.require('./js/autofill.js')
const tags = require.main.require('./js/tags.js') //list of html tags
const importer = require.main.require('./js/importer.js')
importer.parseHTML = require.main.require('./js/parseHTML.js')
const exporter = require.main.require('./js/exporter.js')
const history = new History()
var scope = ''

//DEBUG
// console.log(exporter.domToPug($('doc')))
// console.log(exporter.pugToHTML(exporter.domToPug($('doc'))))

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
    //Not sure if window blur should escape editing mode, but that's what happens in devtools too. It kinda feels more solid and predictable if you always have a 'solid' selection when returning to the app
    commitEdit()
  }
})

//Copy & paste
//TODO: copypaste events seem to work great. Implement functions for setting/getting data and data parsing via http://electron.atom.io/docs/api/clipboard
window.addEventListener('beforecut', beforeCut)
window.addEventListener('beforecopy', beforeCopy)
window.addEventListener('cut', cut)
window.addEventListener('copy', copy)
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
