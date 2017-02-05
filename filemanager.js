'use strict'

const {
  ipcMain,
  dialog,
  BrowserWindow
} = require('electron')

const path = require('path')
const url = require('url')
const fs = require("fs")
const exportHTML =require("./js/export.js")
const importHTML =require("./js/import.js")

//TODO: use macOS native tabs for documents, don't implement any custom tabs. Not enabled in Electron yet, but here's the issue: https://github.com/electron/electron/issues/6124 Tabs have been intentionally disabled, so it shouldn't be hard to add back tab support.


const windowList = []

function newFile (menuItem, browserWindow, event) {
  let newWin = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Ranui - untitled.html',
    //titleBarStyle: 'hidden',
    webPreferences: {
      scrollBounce: true
    },
    backgroundColor: '#272822' //Bg color of doc, so even if loading takes a while, the window won't flash white
  })
  newWin.file = ("untitled.html")
  newWin.untitled =true;
  newWin.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  windowList.push(newWin)
  newWin.on('closed', ()=> {
    windowList.splice(windowList.indexOf(newWin), 1)
    newWin = null
  })
}

//TODO: put window management and file open/save stuff in its own module
function open (menuItem, browserWindow, event) {
  dialog.showOpenDialog({properties: ['openFile','multiSelections']}, paths=>{
    for(var path in paths){
      fs.readFile(paths[path], 'utf-8', function (err, data) {
        console.log(data)//TODO actually import stuff 
      }) 
    }
  })
}
function close (menuItem, browserWindow, event) {
    browserWindow.close()
}

function save (menuItem, browserWindow, event) {
    if(!browserWindow.untitled){
     var ws = fs.createWriteStream(browserWindow.file,{defaultEncoding:"utf-8"});
    exportHTML.requestExport(browserWindow,function(str) {
      ws.write(str);
      ws.close()
    })
    }else{
      saveAs(undefined,browserWindow,undefined)
    }
}
function saveAs (menuItem, browserWindow, event) {
  dialog.showSaveDialog(browserWindow,{title:"Save as..."},function(fname){
    if(fname != undefined){
      var ws = fs.createWriteStream(fname,{defaultEncoding:"utf-8"});
      exportHTML.requestExport(browserWindow,function(str) {
        ws.write(str);
        ws.close()
      })
      browserWindow.untitled = false
      browserWindow.file = (fname)
      browserWindow.setTitle( "Ranui - " + browserWindow.file)
    }
  })
}
function saveAll (menuItem, browserWindow, event) {
  for(var win in windowList){
    save(undefined,windowList[win],undefined)
  }
}



module.exports = {newFile, open, close, save, saveAs, saveAll}
