const path = require('path')

var {EchoPlayServer} = require('./echoplay-server/EchoPlayServer')
const PORT = process.env.PORT || 3000
var server = new EchoPlayServer(path.resolve(__dirname), PORT)

const electron = require('electron')
const url = require('url')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: false,
    center: true,
    transparent: true
  })

  const APP_URL = url.format({
    pathname: 'localhost:'+PORT,
    protocol: 'http:',
    slashes: true
  })

  mainWindow.loadURL(APP_URL)
  console.log(APP_URL)

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
