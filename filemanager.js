'use strict'

const {
  ipcMain,
  dialog,
  BrowserWindow
} = require('electron')

const path = require('path')
const url = require('url')


//TODO: use macOS native tabs for documents, don't implement any custom tabs. Not enabled in Electron yet, but here's the issue: https://github.com/electron/electron/issues/6124 Tabs have been intentionally disabled, so it shouldn't be hard to add back tab support.


const windowList = []

function newFile (menuItem, browserWindow, event) {
  let newWin = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Untitled',
    //titleBarStyle: 'hidden',
    webPreferences: {
      scrollBounce: true
    },
    backgroundColor: '#272822' //Bg color of doc, so even if loading takes a while, the window won't flash white
  })
  newWin.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  //TODO: win.setRepresentedFilename('filename.html') //this should happen on file open
  //TODO: win.setDocumentEdited(true) if not true, this should happen on any edit command in the render process
  newWin.webContents.openDevTools() //for debugging

  windowList.push(newWin)


  newWin.on('closed', ()=> {
    windowList.splice(windowList.indexOf(newWin), 1)
    newWin = null
  })
}

//TODO: put window management and file open/save stuff in its own module
function open (menuItem, browserWindow, event) {
  dialog.showOpenDialog({properties: ['openFile','multiSelections']}, paths=>{
    for (let path in paths) {
      console.log(path)
    }
  })
  //TODO: open file? spawn new window, give that new window the path for opening or maybe text of the file, parse text inside the new window. Do it this way so any problem in parsing will only ever affect the one window.
  //newWindow() needs to take path as a parameter?
}
function close (menuItem, browserWindow, event) {
  browserWindow.close()
  //TODO: if file contents dirty, call saveFile for browserwindow
}

function save (menuItem, browserWindow, event) {
  //TODO: get frontmost window, parse contents to html, show save dialog
  //maybe take in filename as a parameter or something, need to handle saveAs, saveAll too
  //maybe this should get the browserwindow as a parameter? so it would be easy to use this with saveAll

}
function saveAs (menuItem, browserWindow, event) {
  dialog.showSaveDialog()
  //etc...
}
function saveAll (menuItem, browserWindow, event) {
  //TODO: call saveFile for each browserwindow
}



module.exports = {newFile, open, close, save, saveAs, saveAll}
