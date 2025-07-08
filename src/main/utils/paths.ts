import { join } from 'path'

import { is } from '@electron-toolkit/utils'

export function getPythonPath(): string {
  if (is.dev) {
    if (process.platform === 'win32') {
      return join(process.cwd(), 'python', '.venv', 'Scripts', 'python.exe')
    } else if (process.platform === 'darwin') {
      return join(process.cwd(), 'python', '.venv', 'bin', 'python')
    } else {
      throw new Error('サポートしていないプラットフォームです。')
    }
  } else {
    if (process.platform === 'win32') {
      return join(process.resourcesPath, 'python', 'python.exe')
    } else if (process.platform === 'darwin') {
      return join(process.resourcesPath, 'python', 'bin', 'python')
    } else {
      throw new Error('サポートしていないプラットフォームです。')
    }
  }
}

export function getScriptPath(): string {
  if (is.dev) {
    return join(process.cwd(), 'python/src')
  } else {
    return join(process.resourcesPath, 'scripts')
  }
}
