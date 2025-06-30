# Electron-Python Integration Template

electron-vite(React + TypeScript)をベースに、PythonShellを利用してPythonスクリプトが実行できるように拡張したElectronアプリケーションテンプレートです。

## 🚀 主な機能

- **Electron + React + TypeScript**: モダンなデスクトップアプリ開発環境
- **Python統合**: ElectronからPythonスクリプトの実行が可能
- **クロスプラットフォーム**: Windows, macOS対応
- **自動Python環境構築**: ビルド時にプラットフォーム別Python環境を自動ダウンロード

## 📁 プロジェクト構成

```
electron-template/
├── src/
│   ├── main/                     # メインプロセス
│   │   ├── handlers/             # ここにIPCハンドラーを追加
│   │   └── index.ts              # メインプロセスエントリポイント
│   └── renderer/                 # GUIの実装
│
└── python/
    ├── src/                      # Pythonスクリプト配置場所
    │   └── your-script.py
    └── requirements.txt          # Python依存パッケージ
```

## 開発手順

### 1. リポジトリのクローン

```bash
git clone ~~~
npm install
```

### 2. Python環境の構築

python/requirements.txtにプロジェクトで使用するパッケージを記述

```bash
cd python
python -m venv .venv
```

OSごとに異なる方法でアクティベートし、

```
pip install -r requirements.txt
```
