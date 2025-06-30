import { BrowserWindow, dialog, ipcMain } from 'electron'

interface Filters {
  name: string
  extensions: string[]
}

export default function openDialog(mainWindow: BrowserWindow): void {
  ipcMain.handle('open-dialog', async (_event, filters: Filters): Promise<string | undefined> => {
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
