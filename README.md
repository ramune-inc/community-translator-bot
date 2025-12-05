# Community Translator Bot

Discord サーバー内の日本語チャンネルと英語チャンネル間でメッセージを自動翻訳するボットです。DeepL API を使用して高精度な翻訳を提供します。

## 機能

- 日本語チャンネルのメッセージを英語チャンネルに翻訳
- 英語チャンネルのメッセージを日本語チャンネルに翻訳
- 投稿者名を保持した形式で翻訳メッセージを送信

## 技術スタック

- **TypeScript** - 型安全な開発
- **discord.js** - Discord Bot フレームワーク
- **DeepL API** - 高精度翻訳エンジン
- **Docker** - コンテナ化デプロイメント

## セットアップ

### 必要要件

- Node.js 18 以上
- npm または yarn
- Discord Bot トークン
- DeepL API キー

### 環境変数

`.env` ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```env
DISCORD_TOKEN=xxxxx
DEEPL_API_KEY=xxxxx
JP_CHANNEL_ID=xxxxx
EN_CHANNEL_ID=xxxxx
SUPABASE_URL=xxxxx
SUPABASE_ANON_KEY=xxxxx
```

### インストール

```bash
# 依存関係のインストール
npm install

# 開発モードで起動
npm run dev

# 本番ビルド
npm run build
npm start
```

### Docker を使用する場合

```bash
# コンテナを起動
docker compose up -d

# ログを確認
docker compose logs -f
```

## プロジェクト構成

```
src/
├── index.ts              # エントリーポイント
├── app/
│   └── bot.ts            # ボットのメッセージハンドラ
├── core/
│   └── translator.ts     # DeepL 翻訳ロジック
└── infrastructure/
    └── discord.ts        # Discord クライアント設定
```

## ライセンス

なし
