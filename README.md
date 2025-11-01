# Ad Analytics Tool - Meta & Google 広告分析プラットフォーム

gomarble-mcp-serverを活用したMeta広告とGoogle広告の統合分析ツール

## 機能

### 主要機能
- **マルチアカウント管理**: Meta広告とGoogle広告の複数アカウントを一元管理
- **リアルタイム分析**: 広告パフォーマンスをリアルタイムで分析
- **MCP連携**: Claude AIと連携して高度な分析と最適化提案
- **データエクスポート**: 分析結果をCSV形式でエクスポート
- **美しいUI**: TailwindCSSを使用したモダンなデザイン

### 分析機能
- インプレッション、クリック、費用、コンバージョンの推移
- キャンペーン別パフォーマンス比較
- CTR、CPC、CVR、CPAなどの主要指標
- 期間別トレンド分析

## セットアップ

### 必要要件
- Node.js 18以上
- npm または yarn
- Meta広告アカウント
- Google広告アカウント

### インストール手順

1. リポジトリをクローン
```bash
git clone [repository-url]
cd ad-analytics-tool
```

2. 依存関係をインストール
```bash
npm install
```

3. MCPサーバーの依存関係をインストール
```bash
cd mcp-server
npm install
cd ..
```

4. 環境変数を設定
```bash
cp .env.local.example .env.local
```

`.env.local`ファイルを編集して、必要なAPIキーと認証情報を設定：

- `META_APP_ID`: Facebook App ID
- `META_APP_SECRET`: Facebook App Secret
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `GOOGLE_DEVELOPER_TOKEN`: Google Ads Developer Token

### APIキーの取得方法

#### Meta広告（Facebook）
1. [Facebook Developers](https://developers.facebook.com/)にアクセス
2. 新しいアプリを作成
3. Marketing APIを追加
4. App IDとApp Secretを取得

#### Google広告
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Google Ads APIを有効化
4. OAuth 2.0クライアントIDを作成
5. [Google Ads API Center](https://ads.google.com/aw/apicenter)でDeveloper Tokenを取得

## 起動方法

1. MCPサーバーを起動（新しいターミナル）
```bash
cd mcp-server
npm start
```

2. Next.jsアプリケーションを起動
```bash
npm run dev
```

3. ブラウザで http://localhost:3000 にアクセス

## 使い方

### 初回ログイン
1. メールアドレスとパスワードを入力してログイン
2. 初回の場合は自動的にアカウントが作成されます

### アカウント連携
1. ダッシュボードの「アカウント管理」に移動
2. Meta広告またはGoogle広告の「追加」ボタンをクリック
3. 各プラットフォームの認証画面でログイン
4. 必要な権限を許可

### 分析の実行
1. サイドバーから分析したいアカウントを選択
2. 日付範囲を選択
3. リアルタイムでパフォーマンスデータを確認
4. 必要に応じてCSVエクスポート

## MCP（Model Context Protocol）連携

このツールはgomarble-mcp-serverと連携して、Claude AIによる高度な分析が可能です。

### MCP設定（Claude Desktop）
1. Claude Desktopの設定を開く
2. Extensions → MCP Serversで新しいサーバーを追加
3. 以下の設定を使用：

```json
{
  "name": "ad-analytics-mcp",
  "command": "node",
  "args": ["mcp-server/server.js"],
  "env": {
    "MCP_SERVER_PORT": "3001"
  }
}
```

### Claude連携機能
- 広告パフォーマンスの自動分析
- 最適化提案の生成
- 異常検知とアラート
- レポート作成支援

## プロジェクト構造

```
ad-analytics-tool/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── dashboard/         # ダッシュボード
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ関数
├── mcp-server/           # MCPサーバー実装
└── public/               # 静的ファイル
```

## 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **スタイリング**: TailwindCSS
- **状態管理**: Zustand
- **データフェッチ**: React Query (TanStack Query)
- **チャート**: Recharts
- **認証**: JWT
- **API連携**: Meta Marketing API, Google Ads API
- **MCP**: gomarble-mcp-server

## セキュリティ

- トークンは暗号化して保存
- HTTPS通信を使用
- 環境変数で機密情報を管理
- JWTによる認証

## トラブルシューティング

### よくある問題

1. **Meta API認証エラー**
   - App IDとApp Secretが正しいか確認
   - リダイレクトURIが設定と一致しているか確認

2. **Google Ads APIエラー**
   - Developer Tokenが承認されているか確認
   - OAuth scopeが適切に設定されているか確認

3. **MCP接続エラー**
   - MCPサーバーが起動しているか確認
   - ポート3001が使用可能か確認

## ライセンス

MIT License

## サポート

問題が発生した場合は、Issueを作成してください。