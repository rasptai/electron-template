import fs from 'fs/promises'

async function main(): Promise<void> {
  try {
    console.log('Python環境をクリーンアップしています...')
    await fs.rm('runtime', { recursive: true, force: true })
    console.log('runtimeフォルダを削除しました')
  } catch (error) {
    console.error('クリーンアップに失敗しました:', error)
    process.exit(1)
  }
}

main()
