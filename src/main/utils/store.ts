import Store from 'electron-store'

interface GeneralStore {
  x?: number
  y?: number
  width?: number
  height?: number
}

// ウィンドウサイズ・位置
export const generalStore = new Store<GeneralStore>({ name: 'window' })
