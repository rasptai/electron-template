import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

import { electronApp, is, optimizer } from '@electron-toolkit/utils'

import openDialog from './handlers/open-dialog'
import runPythonScript from './handlers/run-python-script'
import { generalStore } from './utils/store'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    x: generalStore.get('x'),
    y: generalStore.get('y'),
    width: generalStore.get('width'),
    height: generalStore.get('height'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', () => {
    const { x, y, width, height } = mainWindow.getBounds()
    generalStore.set({ x, y, width, height })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  runPythonScript()
  openDialog()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
