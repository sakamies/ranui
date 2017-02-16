'use strict'

const {
  app,
  shell,
  Menu,
  BrowserWindow,
  MenuItem,
  ipcMain,
} = require('electron')

const fileManager = require('./filemanager.js')



//TODO: track frontmost window and send menu messages there?

function createMenu() {
  const menuTemplate = [
    {
      label: app.name,
      submenu: [
      {
        role: 'about',
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: app.quit
      },
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'Command+N',
          click: fileManager.newFile
        },
        {
          label: 'Open…',
          accelerator: 'Command+O',
          click: fileManager.open
        },
        {
          label: 'Save',
          accelerator: 'Command+S',
          click: fileManager.save //TODO: fix saveAs etc.
        },
        {
          label: 'Save As…',
          accelerator: 'Command+Shift+S',
          click: fileManager.saveAs
        },
        {
          label: 'Save All',
          accelerator: 'Command+Option+S',
          click: fileManager.saveAll
        },
        {
          type: 'separator'
        },
        {
          label: 'Close File',
          accelerator: 'Command+W',
          click: fileManager.close
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          //role: 'undo',
          click: (menuItem, browserWindow, event)=>{
            browserWindow.webContents.send('undo')
          }
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          //role: 'redo',
          click: (menuItem, browserWindow, event)=>{
            browserWindow.webContents.send('redo')
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        },
        {
          label: 'Speech',
          submenu: [
            {
              role: 'startspeaking'
            },
            {
              role: 'stopspeaking'
            }
          ]
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          role: 'reload'
        },
        {
          role: 'toggledevtools'
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'zoom'
        },
        {
          type: 'separator'
        },
        {
          role: 'front'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'As @sakamies on Twitter',
          click: ()=>{
            shell.openExternal('https://twitter.com/sakamies')
          }
        },
      ]
    },
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

function createDockMenu() {
  const menuTemplate = [
    {
      label: 'New File',
      click: fileManager.newFile
    },
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  app.dock.setMenu(menu)
}

app.on('ready', ()=>{
  createMenu()
  createDockMenu()
  fileManager.newFile()
})
app.on('window-all-closed', ()=>{
  if (process.platform !== 'darwin')
    app.quit()
})
app.on('activate', ()=> {
  if (BrowserWindow.getAllWindows().length === 0) {
    fileManager.newFile()
  }
})
