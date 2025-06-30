import { exec } from 'child_process'
import fs from 'fs/promises'
import * as tar from 'tar'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ReleaseAsset {
  name: string
}

interface ReleaseData {
  tag_name: string
  assets: ReleaseAsset[]
}

// プラットフォーム設定を共通化
const PLATFORM_CONFIG = {
  '--win': {
    platformStr: 'pc-windows-msvc',
    arch: 'x86_64',
    pythonExecutable: 'runtime/python.exe'
  },
  '--mac': {
    platformStr: 'apple-darwin',
    arch: 'aarch64',
    pythonExecutable: 'runtime/bin/python'
  }
} as const

function getPlatformConfig(
  platform: string
): (typeof PLATFORM_CONFIG)[keyof typeof PLATFORM_CONFIG] {
  if (platform !== '--win' && platform !== '--mac') {
    throw new Error(`サポートされていないプラットフォーム: ${platform}`)
  }
  return PLATFORM_CONFIG[platform]
}

async function getPythonVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('python/.venv/bin/python --version')
    const version = stdout.trim().replace('Python ', '')
    return version
  } catch {
    throw new Error('.venvからPythonバージョンの取得に失敗しました')
  }
}

async function getLatestReleaseData(): Promise<ReleaseData> {
  const response = await fetch(
    'https://api.github.com/repos/indygreg/python-build-standalone/releases/latest'
  )
  if (!response.ok) {
    throw new Error('最新リリース情報の取得に失敗しました')
  }
  const data = (await response.json()) as { tag_name: string; assets: ReleaseAsset[] }
  return { tag_name: data.tag_name, assets: data.assets }
}

function findBestPythonVersion(
  assets: ReleaseAsset[],
  desiredVersion: string,
  platform: string
): string {
  const { platformStr, arch } = getPlatformConfig(platform)

  // まず完全一致のバージョンを探す
  const exactMatch = assets.find(
    (asset: ReleaseAsset) =>
      asset.name.includes(`cpython-${desiredVersion}+`) &&
      asset.name.includes(platformStr) &&
      asset.name.includes(arch) &&
      asset.name.includes('install_only.tar.gz')
  )

  if (exactMatch) {
    console.log(`完全一致のバージョンが見つかりました: ${desiredVersion}`)
    return desiredVersion
  }

  // 同じマイナーバージョンで新しいパッチバージョンを探す
  const majorMinor = desiredVersion.split('.').slice(0, 2).join('.')
  const availableVersions = assets
    .filter(
      (asset: ReleaseAsset) =>
        asset.name.includes(`cpython-${majorMinor}.`) &&
        asset.name.includes(platformStr) &&
        asset.name.includes(arch) &&
        asset.name.includes('install_only.tar.gz')
    )
    .map((asset: ReleaseAsset) => {
      const match = asset.name.match(/cpython-(\d+\.\d+\.\d+)\+/)
      return match ? match[1] : null
    })
    .filter((version): version is string => version !== null)
    .sort((a: string, b: string) => {
      const aPatch = parseInt(a.split('.')[2])
      const bPatch = parseInt(b.split('.')[2])
      return bPatch - aPatch // 降順でソート
    })

  if (availableVersions.length > 0) {
    const bestVersion = availableVersions[0]!
    console.log(`新しいパッチバージョンを使用します: ${bestVersion} (要求: ${desiredVersion})`)
    return bestVersion
  }

  throw new Error(
    `${desiredVersion} の互換性のあるPythonバージョンが ${platform} で見つかりませんでした`
  )
}

function buildDownloadUrl(pythonVersion: string, platform: string, releaseDate: string): string {
  const { platformStr, arch } = getPlatformConfig(platform)

  return `https://github.com/indygreg/python-build-standalone/releases/download/${releaseDate}/cpython-${pythonVersion}+${releaseDate}-${arch}-${platformStr}-install_only.tar.gz`
}

async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`ダウンロードに失敗しました: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await fs.writeFile(filename, new Uint8Array(buffer))
}

async function extractAndCleanup(filename: string): Promise<void> {
  // 既存のruntimeディレクトリを削除してから作成
  try {
    await fs.rm('runtime', { recursive: true, force: true })
  } catch {
    // ディレクトリが存在しない場合は無視
  }

  await fs.mkdir('runtime', { recursive: true })

  await tar.extract({
    file: filename,
    cwd: 'runtime',
    strip: 1
  })

  await fs.unlink(filename)
}

async function installRequirements(platform: string): Promise<void> {
  const requirementsPath = 'python/requirements.txt'
  try {
    await fs.access(requirementsPath)
    console.log('requirements.txtが見つかりました。パッケージをインストールしています...')

    const { pythonExecutable } = getPlatformConfig(platform)

    await execAsync(`${pythonExecutable} -m pip install -r ${requirementsPath}`)
    console.log('パッケージのインストールが完了しました')
  } catch (error) {
    // ファイルが存在しない場合
    try {
      await fs.access(requirementsPath)
    } catch {
      console.log('requirements.txtが見つかりません。パッケージインストールをスキップします')
      return
    }

    // ファイルは存在するがインストールに失敗した場合
    throw new Error(`パッケージのインストールに失敗しました: ${error}`)
  }
}

async function main(): Promise<void> {
  const platform = process.argv[2]

  if (!platform || (platform !== '--win' && platform !== '--mac')) {
    console.error('--win または --mac を指定してください')
    process.exit(1)
  }

  try {
    console.log('Pythonバージョンを取得しています...')
    const localPythonVersion = await getPythonVersion()
    console.log(`ローカルのPythonバージョン: ${localPythonVersion}`)

    console.log('最新リリース情報を取得しています...')
    const releaseData = await getLatestReleaseData()
    console.log(`最新リリース: ${releaseData.tag_name}`)

    const bestPythonVersion = findBestPythonVersion(
      releaseData.assets,
      localPythonVersion,
      platform
    )

    const url = buildDownloadUrl(bestPythonVersion, platform, releaseData.tag_name)
    const filename = `python-${bestPythonVersion}-${platform.replace('--', '')}.tar.gz`

    console.log(`ダウンロード元: ${url}`)
    await downloadFile(url, filename)
    console.log('ダウンロード完了')

    console.log('アーカイブを展開しています...')
    await extractAndCleanup(filename)
    console.log('展開完了')

    console.log('依存パッケージをインストールしています...')
    await installRequirements(platform)

    console.log('セットアップが正常に完了しました！')
  } catch (error) {
    console.error('セットアップに失敗しました:', error)
    process.exit(1)
  }
}

main()
