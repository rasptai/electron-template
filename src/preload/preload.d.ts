export interface IElectronAPI {
  openDialog: () => Promise<string | undefined>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
