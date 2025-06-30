import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function getPythonPath(): string {
  // 開発環境であれば仮想環境、本番環境であればelectron-builderで指定したextraResourcesフォルダ
  const basePath = is.dev
    ? join(process.cwd(), 'python/.venv')
    : join(process.resourcesPath, 'python')

  if (process.platform === 'win32') {
    return join(basePath, 'python.exe')
  } else {
    return join(basePath, 'bin', 'python')
  }
}

export function getScriptPath(): string {
  if (is.dev) {
    return join(process.cwd(), 'python/src')
  } else {
    return join(process.resourcesPath, 'scripts')
  }
}
