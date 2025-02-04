import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'

const __dirname = import.meta.dirname

let mainWindow: BrowserWindow
let pythonProcess: ChildProcess | null = null // 開発環境時はnull

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.mjs'), // viteによってトランスパイルされたpreloadファイル
      sandbox: false,
    },
  })
  if (app.isPackaged) {
    // パッケージ化されたアプリケーションの場合はmain.pyを実行
    pythonProcess = spawn(join(process.resourcesPath, 'python/python.exe'), [
      join(process.resourcesPath, 'scripts/main.py'),
    ])
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    // 開発環境の場合はviteを使用
    win.loadURL('http://localhost:5173')
  }
  win.on('ready-to-show', () => {
    win.show()
  })
  return win
}

// appが準備できたらウィンドウを作成する
app.whenReady().then(() => {
  mainWindow = createWindow()
})

ipcMain.handle('open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
  })
  if (result.canceled) return
  return result.filePaths[0]
})

// すべてのウィンドウが閉じられたときにアプリケーションを終了する
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 終了時にPythonプロセスも終了する
app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill()
  }
})
