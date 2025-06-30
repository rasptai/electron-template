import { ipcMain } from 'electron'
import { PythonShell } from 'python-shell'

import { getPythonPath, getScriptPath } from '../utils/paths'

export default function runPythonScript(): void {
  ipcMain.handle(
    'run-python-script',
    async (_event, script: string, args: object = {}): Promise<string[]> => {
      return await PythonShell.run(script, {
        pythonPath: getPythonPath(),
        scriptPath: getScriptPath(),
        args: [JSON.stringify(args)]
      })
    }
  )
}
