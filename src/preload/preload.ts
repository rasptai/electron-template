import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openDialog: async () => {
    return await ipcRenderer.invoke('open-dialog')
  },
})
