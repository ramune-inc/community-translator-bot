# 技術ドキュメント

このドキュメントは、Community Translator Bot の技術的な概要を説明します。

## 目次

- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)
- [ディレクトリ構成](#ディレクトリ構成)
- [環境構成](#環境構成)
- [データベース](#データベース)
- [コマンドリファレンス](#コマンドリファレンス)
- [開発ワークフロー](#開発ワークフロー)

---

## 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| ランタイム | Node.js | 22.x | JavaScript 実行環境 |
| 言語 | TypeScript | 5.6.x | 型安全な開発 |
| Discord | discord.js | 14.x | Discord Bot API |
| 翻訳 | DeepL API | - | 日英翻訳 |
| ORM | Drizzle ORM | 0.45.x | 型安全なデータベース操作 |
| データベース | PostgreSQL | 16 | ローカル開発用 DB |
| 拡張機能 | pgvector | 0.8.x | ベクトル検索対応 |
| 本番 DB | Supabase | - | 本番環境のデータベース |
| コンテナ | Docker | - | 開発環境の構築 |

---

## アーキテクチャ

本プロジェクトはクリーンアーキテクチャに基づいて設計されています。

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  bot.ts - Discord イベントハンドラー                   │    │
│  │  index.ts - エントリポイント、DI 設定                  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                       Core Layer                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  entities/ - ドメインエンティティ                      │    │
│  │  repositories/ - リポジトリインターフェース            │    │
│  │  translator.ts - 翻訳ロジック                         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  database/ - Drizzle ORM、スキーマ、リポジトリ実装    │    │
│  │  discord.ts - Discord クライアント設定                │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      External Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │   Discord    │  │    DeepL     │       │
│  │  (pgvector)  │  │     API      │  │     API      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 設計原則

- **依存性逆転の原則**: Core 層はインターフェースを定義し、Infrastructure 層が実装を提供
- **単一責任の原則**: 各モジュールは明確な責務を持つ
- **DI (依存性注入)**: index.ts でリポジトリを生成し、ハンドラーに注入

---

## ディレクトリ構成

```
community-translator-bot/
├── docs/                          # ドキュメント
├── drizzle/                       # マイグレーションファイル（自動生成）
│   ├── 0000_*.sql                 # 初期マイグレーション
│   └── meta/                      # Drizzle メタデータ
├── src/
│   ├── index.ts                   # エントリポイント
│   ├── app/
│   │   └── bot.ts                 # Discord イベントハンドラー
│   ├── core/
│   │   ├── entities/
│   │   │   └── chatLog.ts         # ChatLog エンティティ
│   │   ├── repositories/
│   │   │   └── chatLogRepository.ts  # IChatLogRepository インターフェース
│   │   └── translator.ts          # DeepL 翻訳ロジック
│   └── infrastructure/
│       ├── database/
│       │   ├── client.ts          # Drizzle クライアント
│       │   ├── schema.ts          # テーブル定義
│       │   ├── migrate.ts         # マイグレーション実行スクリプト
│       │   └── repositories/
│       │       └── drizzleChatLogRepository.ts  # リポジトリ実装
│       └── discord.ts             # Discord クライアント設定
├── .env                           # ローカル環境変数（Git 管理外）
├── .env.example                   # 環境変数テンプレート
├── .env.prod                      # 本番環境変数（Git 管理外）
├── docker-compose.yml             # ローカル開発用 Docker 設定
├── docker-compose.prod.yml        # 本番用 Docker 設定
├── drizzle.config.ts              # Drizzle Kit 設定
├── Dockerfile                     # Bot コンテナ定義
├── package.json                   # 依存関係とスクリプト
└── tsconfig.json                  # TypeScript 設定
```

### 各ディレクトリの責務

| ディレクトリ | 責務 |
|-------------|------|
| `src/app/` | アプリケーション層。Discord イベントを受け取り、適切な処理を呼び出す |
| `src/core/entities/` | ドメインエンティティ。外部ライブラリに依存しない純粋なデータ構造 |
| `src/core/repositories/` | リポジトリインターフェース。データアクセスの抽象化 |
| `src/infrastructure/database/` | データベース関連。Drizzle ORM の設定とリポジトリ実装 |
| `src/infrastructure/` | 外部サービスとの接続。Discord クライアントなど |
| `drizzle/` | Drizzle Kit が自動生成するマイグレーションファイル |

---

## 環境構成

### ローカル開発環境

ローカル開発では Docker で PostgreSQL (pgvector) を起動し、Supabase を模倣します。

| サービス | ホスト | ポート | 認証情報 |
|---------|-------|-------|---------|
| PostgreSQL | db (Docker 内) / localhost (外部) | 5432 | postgres / postgres |
| Bot | bot (Docker 内) | - | - |

### 本番環境

本番環境では Supabase を使用します。

| サービス | 設定 |
|---------|------|
| データベース | Supabase PostgreSQL |
| Bot | Docker コンテナ（要デプロイ先設定） |

### 環境変数

| 変数名 | 説明 | ローカル | 本番 |
|-------|------|---------|------|
| `DISCORD_TOKEN` | Discord Bot トークン | 必須 | 必須 |
| `DEEPL_API_KEY` | DeepL API キー | 必須 | 必須 |
| `JP_CHANNEL_ID` | 日本語チャンネル ID | 必須 | 必須 |
| `EN_CHANNEL_ID` | 英語チャンネル ID | 必須 | 必須 |
| `DATABASE_URL` | PostgreSQL 接続 URL | 必須 | - |
| `SUPABASE_URL` | Supabase プロジェクト URL | - | 必須 |
| `SUPABASE_ANON_KEY` | Supabase 匿名キー | - | 必須 |

---

## データベース

### スキーマ

現在のテーブル構成:

**chat_logs テーブル**

| カラム | 型 | 説明 |
|-------|-----|------|
| id | SERIAL | 主キー |
| discord_user_id | VARCHAR(255) | Discord ユーザー ID |
| discord_username | VARCHAR(255) | Discord ユーザー名 |
| channel_type | VARCHAR(10) | チャンネル種別（JP / EN） |
| original_message | TEXT | 元のメッセージ |
| translated_message | TEXT | 翻訳後のメッセージ |
| embedding | VECTOR(1536) | ベクトル埋め込み（将来利用） |
| created_at | TIMESTAMPTZ | 作成日時 |

### インデックス

- `idx_chat_logs_created_at` - 作成日時での検索最適化
- `idx_chat_logs_channel_type` - チャンネル種別での絞り込み
- `idx_chat_logs_user_id` - ユーザー ID での検索

### pgvector

将来的な機能拡張のため、pgvector 拡張機能を有効化しています。
これにより、メッセージの類似検索やセマンティック検索を実装可能です。

---

## コマンドリファレンス

### 開発

```bash
# ローカル開発サーバー起動（ホットリロード対応）
npm run dev

# TypeScript ビルド
npm run build

# 本番用サーバー起動
npm run start
```

### データベース

```bash
# スキーマからマイグレーションファイルを生成
npm run db:generate

# マイグレーションを実行（pgvector 拡張機能も有効化）
npm run db:migrate

# スキーマを直接 DB に反映（開発時のみ推奨）
npm run db:push

# Drizzle Studio 起動（GUI でデータ確認）
npm run db:studio
```

### Docker

```bash
# PostgreSQL のみ起動
docker compose up -d db

# Bot も含めて全サービス起動
docker compose up -d

# ログ確認
docker compose logs -f bot

# サービス停止
docker compose down

# イメージ再ビルド（依存関係変更時）
docker compose build bot --no-cache
```

### データベース直接操作

```bash
# psql でデータベースに接続
docker compose exec db psql -U postgres -d community_translator

# テーブル一覧表示
docker compose exec db psql -U postgres -d community_translator -c "\dt"

# チャットログ確認
docker compose exec db psql -U postgres -d community_translator -c "SELECT * FROM chat_logs;"
```

---

## 開発ワークフロー

### 初回セットアップ

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd community-translator-bot

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.example .env
# .env を編集して必要な値を設定

# 4. Docker を起動
docker compose up -d db

# 5. マイグレーションを実行
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/community_translator npm run db:migrate

# 6. Bot を起動
docker compose up -d bot
```

### スキーマ変更

1. `src/infrastructure/database/schema.ts` を編集
2. マイグレーションファイルを生成
   ```bash
   npm run db:generate
   ```
3. マイグレーションを実行
   ```bash
   npm run db:migrate
   ```

### 新しいエンティティの追加

1. `src/core/entities/` にエンティティを定義
2. `src/core/repositories/` にリポジトリインターフェースを追加
3. `src/infrastructure/database/schema.ts` にテーブル定義を追加
4. `src/infrastructure/database/repositories/` にリポジトリ実装を追加
5. `src/index.ts` で DI を設定

### トラブルシューティング

**Bot が起動しない場合**

```bash
# ログを確認
docker compose logs bot

# コンテナを再ビルド
docker compose build bot --no-cache
docker compose up -d bot
```

**データベース接続エラー**

```bash
# PostgreSQL が起動しているか確認
docker compose ps

# ヘルスチェック確認
docker compose exec db pg_isready -U postgres
```

**マイグレーションエラー**

```bash
# データを削除してやり直す場合
docker compose down -v  # ボリュームも削除
docker compose up -d db
npm run db:migrate
```

---

## 関連ドキュメント

- [Discord.js ドキュメント](https://discord.js.org/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [DeepL API ドキュメント](https://www.deepl.com/docs-api)
- [pgvector ドキュメント](https://github.com/pgvector/pgvector)
