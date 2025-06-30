import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      runPythonScript: (script: string, args?: object) => Promise<string[]>
    }
  }
}
