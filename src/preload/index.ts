import { contextBridge, ipcRenderer } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

const api = {
  runPythonScript: async (script: string, args: object = {}) => {
    return await ipcRenderer.invoke('run-python-script', script, args)
  },
  openDialog: async (filters: { name: string; extensions: string[] }) => {
    return await ipcRenderer.invoke('open-dialog', filters)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
