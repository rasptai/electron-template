import { BrowserWindow, dialog, ipcMain } from 'electron'

interface Filters {
  name: string
  extensions: string[]
}

export default function openDialog(): void {
  ipcMain.handle('open-dialog', async (_event, filters: Filters): Promise<string | undefined> => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (!mainWindow) return

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ ...filters }]
    })
    if (result.canceled) {
      return
    }

    return result.filePaths[0]
  })
}
