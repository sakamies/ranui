const {
  app,
  shell,
  BrowserWindow,
  dialog,
  Menu,
  MenuItem,
  ipcMain,
} = require('electron')
const path = require('path')
const url = require('url')



let windows = []
function newWindow () {
  let win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Untitled',
    //titleBarStyle: 'hidden',
    webPreferences: {
      scrollBounce: true
    },
    backgroundColor: '#272822' //Bg color of doc, so even if loading takes a while, the window won't flash white
  })
  win.on('closed', ()=> {
    windows.splice(windows.indexOf(win), 1)
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  //TODO: win.setRepresentedFilename('filename.html') //this should happen on file open
  //TODO: win.setDocumentEdited(true) if not true, this should happen on any edit command in the render process
  win.webContents.openDevTools() //for debugging

  windows.push(win)
}

//TODO: put window management and file open/save stuff in its own module
function openFile(paths) {
  console.log(paths)
  //TODO: open file? spawn new window, give that new window the path for opening or maybe text of the file, parse text inside the new window. Do it this way so any problem in parsing will only ever affect the one window.
  //newWindow() needs to take path as a parameter?
}
function saveFile (filename) {
  //TODO: get frontmost window, parse contents to html, show save dialog
  //maybe take in filename as a parameter or something, need to handle saveAs, saveAll too
  //maybe this should get the browserwindow as a parameter? so it would be easy to use this with saveAll
  dialog.showSaveDialog()
}
function saveAs () {
  // body...
}
function saveAll () {
  //TODO: call saveFile for each browserwindow
}




//TODO: track frontmost window and send menu messages there?

function createMenu() {
  const menuTemplate = [
    {
      label: app.name,
      submenu: [
      {
        role: 'about'
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
        label: 'Show All',
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
          click: newWindow
        },
        {
          label: 'Open...',
          accelerator: 'Command+O',
          click: ()=> {
            dialog.showOpenDialog({properties: ['openFile','multiSelections']}, openFile)
          }
        },
        {
          label: 'Save',
          accelerator: 'Command+S',
          click: saveFile
        },
        {
          label: 'Save As...',
          accelerator: 'Command+Shift+S',
          click: saveAs
        },
        {
          label: 'Save All',
          accelerator: 'Command+Option+S',
          click: saveAll
        },
        {
          type: 'separator'
        },
        {
          label: 'Close File',
          accelerator: 'Command+W',
          click: ()=>{}
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
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
          click: function() {
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
      label: 'New Window',
      click: newWindow
    },
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  app.dock.setMenu(menu)
}

app.on('ready', ()=> {
  createMenu()
  createDockMenu()
  newWindow()
})

app.on('activate', ()=> {
  if (windows.length === 0) {
    newWindow()
  }
})
