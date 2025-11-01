# メタ広告とGoogle広告の分析ツール

gomarble-mcp-serverを活用したメタ広告とGoogle広告の分析ツールです。マルチアカウント機能により、各ユーザーが複数の広告アカウントを管理し、分析結果を取得できます。

## 主な機能

1. **マルチアカウント管理**
   - Google AdsとMeta Adsのアカウント連携
   - OAuth認証による安全なトークン管理
   - アカウントごとのデータ管理

2. **広告分析**
   - gomarble-mcp-serverを使用した高度な分析
   - メトリクス（インプレッション、クリック、費用、CTR、CPC、コンバージョン等）の取得
   - インサイトと推奨事項の自動生成

3. **定期レポート送信**
   - 週次または月次の定期レポート生成
   - チャットワークへの自動送信機能
   - 報告資料の自動生成

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
cd mcp-server && npm install
```

### 2. データベースのセットアップ

PostgreSQLデータベースを作成し、Prismaマイグレーションを実行します。

```bash
# 環境変数を設定
cp .env.example .env
# .envファイルを編集してデータベースURLなどを設定

# Prismaマイグレーション
npx prisma migrate dev

# Prismaクライアント生成
npx prisma generate
```

### 3. 環境変数の設定

`.env`ファイルに以下の環境変数を設定してください：

- `DATABASE_URL`: PostgreSQLデータベースの接続URL
- `JWT_SECRET`: JWTトークンの秘密鍵
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DEVELOPER_TOKEN`: Google Ads APIの認証情報
- `META_APP_ID`, `META_APP_SECRET`: Meta Ads APIの認証情報
- `INTERNAL_API_KEY`: 定期レポート実行用の内部APIキー

### 4. アプリケーションの起動

```bash
# Next.jsアプリケーション（ポート3000）
npm run dev

# MCPサーバー（ポート3001）
cd mcp-server
npm start
```

## APIエンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報取得

### アカウント管理
- `GET /api/accounts` - アカウント一覧取得
- `POST /api/accounts` - アカウント追加
- `PUT /api/accounts` - アカウント更新
- `DELETE /api/accounts` - アカウント削除

### 広告連携
- `GET /api/google/auth` - Google Ads認証開始
- `GET /api/google/callback` - Google Ads認証コールバック
- `GET /api/meta/auth` - Meta Ads認証開始
- `GET /api/meta/callback` - Meta Ads認証コールバック

### データ取得
- `POST /api/data/google` - Google Adsデータ取得
- `POST /api/data/meta` - Meta Adsデータ取得

### 分析・レポート
- `POST /api/mcp/analyze` - 分析実行（gomarble-mcp-server経由）
- `POST /api/reports/generate` - レポート生成
- `POST /api/reports/schedule` - 定期レポート設定
- `GET /api/reports/schedule` - 定期レポート設定取得
- `POST /api/reports/process-scheduled` - 定期レポート実行（cronジョブ用）

## 定期レポートの設定

定期レポートは、`/api/reports/schedule`エンドポイントで設定できます。

```json
{
  "accountId": "account_id",
  "frequency": "weekly", // または "monthly"
  "dayOfWeek": 1, // 週次の場合: 0=日曜日, 1=月曜日, ...
  "dayOfMonth": 1, // 月次の場合: 1-31
  "chatworkRoomId": "room_id",
  "chatworkApiToken": "api_token"
}
```

定期レポートは、`/api/reports/process-scheduled`エンドポイントをcronジョブで定期的に呼び出すことで実行されます。

### Cronジョブの設定例（1時間ごと）

```bash
# crontabに追加
0 * * * * curl -X POST http://localhost:3000/api/reports/process-scheduled -H "Authorization: Bearer YOUR_INTERNAL_API_KEY"
```

## チャットワーク連携

チャットワークにレポートを送信するには、チャットワークのAPIトークンとルームIDが必要です。

1. [Chatwork API](https://developer.chatwork.com/)でAPIトークンを取得
2. 送信先のルームIDを取得
3. 定期レポート設定時に`chatworkRoomId`と`chatworkApiToken`を指定

## 技術スタック

- **フロントエンド/バックエンド**: Next.js 16, React 19, TypeScript
- **データベース**: PostgreSQL (Prisma ORM)
- **認証**: JWT
- **広告API**: Google Ads API, Meta Ads API
- **分析**: gomarble-mcp-server
- **通知**: Chatwork API

## 注意事項

- Mockデータやサンプルデータは使用していません。すべて実際のAPI連携を行います。
- 認証情報はデータベースに暗号化して保存されます。
- 定期レポートの実行には、cronジョブまたはスケジューラーサービスの設定が必要です。

## ライセンス

ISC