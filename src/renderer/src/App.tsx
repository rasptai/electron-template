// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../preload/preload.d.ts" />

import { useState } from 'react'

const App = () => {
  const [path, setPath] = useState<string | null>(null)

  const handleOpenDialog = async () => {
    const path = await window.electronAPI.openDialog()
    if (path) setPath(path)
  }

  return (
    <>
      <button onClick={handleOpenDialog}>Open Dialog</button>
      <p>{path}</p>
    </>
  )
}

export default App
