import { useState } from 'react'

import electronLogo from './assets/electron.svg'
import Versions from './components/Versions'

function App(): React.JSX.Element {
  const [message, setMessage] = useState<string>('')

  const ipcHandle = async (): Promise<void> => {
    const result = await window.api.runPythonScript('your-script.py')
    setMessage(result[0])
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Run your-script.py
          </a>
        </div>
      </div>
      <p className="tip">{message}</p>
      <Versions></Versions>
    </>
  )
}

export default App
