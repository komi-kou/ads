"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Facebook, Globe, Plus, Trash2, RefreshCw, Check, X, AlertCircle, Link2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "./ui/Alert";
import { Modal } from "./ui/Modal";

export function AccountManager() {
  const { accounts, addAccount, removeAccount } = useStore();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"meta" | "google" | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback
    const metaToken = searchParams.get("meta_token");
    const googleAccessToken = searchParams.get("google_access_token");
    const googleRefreshToken = searchParams.get("google_refresh_token");
    const platform = searchParams.get("platform");
    const isDemo = searchParams.get("demo");
    const message = searchParams.get("message");

    if (isDemo === "true") {
      // デモモード: サンプルアカウントを追加
      if (platform === "meta") {
        addAccount({
          id: `demo_meta_${Date.now()}`,
          platform: "meta",
          accountId: "demo_meta_account",
          accountName: "Demo Meta広告アカウント",
          isActive: true,
          lastSynced: new Date(),
        });
      } else if (platform === "google") {
        addAccount({
          id: `demo_google_${Date.now()}`,
          platform: "google",
          accountId: "demo_google_account",
          accountName: "Demo Google広告アカウント",
          isActive: true,
          lastSynced: new Date(),
        });
      }

      // メッセージを表示
      setMessage({
        type: 'info',
        text: 'デモアカウントが追加されました。実際のデータを使用するには、APIキーの設定が必要です。'
      });
      setShowSetupModal(true);

      // URLパラメータをクリア
      router.push("/dashboard");
    } else if (metaToken && platform === "meta") {
      handleMetaCallback(metaToken);
    } else if (googleAccessToken && googleRefreshToken && platform === "google") {
      handleGoogleCallback(googleAccessToken, googleRefreshToken);
    }
  }, [searchParams]);

  const handleMetaCallback = async (token: string) => {
    try {
      // Get account info using the token
      const response = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${token}`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const account = data.data[0];
        addAccount({
          id: `meta_${account.id}`,
          platform: "meta",
          accountId: account.id,
          accountName: account.name || `Meta Account ${account.id}`,
          isActive: true,
          lastSynced: new Date(),
        });

        // Store token securely (in production, use secure backend storage)
        localStorage.setItem(`meta_token_${account.id}`, token);
      }

      // Clear URL params
      router.push("/dashboard");
    } catch (error) {
      console.error("Error handling Meta callback:", error);
    }
  };

  const handleGoogleCallback = async (accessToken: string, refreshToken: string) => {
    try {
      // In production, exchange tokens and get account info from backend
      const mockAccount = {
        id: `google_${Date.now()}`,
        platform: "google" as const,
        accountId: `customer_${Date.now()}`,
        accountName: "Google Ads Account",
        isActive: true,
        lastSynced: new Date(),
      };

      addAccount(mockAccount);
      
      // Store tokens securely (in production, use secure backend storage)
      localStorage.setItem(`google_access_${mockAccount.accountId}`, accessToken);
      localStorage.setItem(`google_refresh_${mockAccount.accountId}`, refreshToken);

      // Clear URL params
      router.push("/dashboard");
    } catch (error) {
      console.error("Error handling Google callback:", error);
    }
  };

  const handleAddAccount = async (platform: "meta" | "google") => {
    setSelectedPlatform(platform);
    setIsAddingAccount(true);

    // 直接APIエンドポイントにリダイレクト
    const endpoint = platform === "meta" ? "/api/meta/auth" : "/api/google/auth";
    window.location.href = endpoint;
  };

  const handleRemoveAccount = (accountId: string) => {
    if (confirm("このアカウントを削除してもよろしいですか？")) {
      removeAccount(accountId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">広告アカウント管理</h2>
          <p className="text-muted-foreground mt-1">
            Meta広告とGoogle広告のアカウントを接続して管理します
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Ads Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Meta広告</h3>
            </div>
            <button
              onClick={() => handleAddAccount("meta")}
              disabled={isAddingAccount}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              追加
            </button>
          </div>

          <div className="space-y-3">
            {accounts.filter((a) => a.platform === "meta").map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{account.accountName}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {account.accountId}
                  </p>
                  {account.lastSynced && (
                    <p className="text-xs text-muted-foreground">
                      最終同期: {new Date(account.lastSynced).toLocaleString("ja-JP")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {account.isActive ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <button
                    onClick={() => handleRemoveAccount(account.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {accounts.filter((a) => a.platform === "meta").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Meta広告アカウントが追加されていません
              </p>
            )}
          </div>
        </div>

        {/* Google Ads Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Google広告</h3>
            </div>
            <button
              onClick={() => handleAddAccount("google")}
              disabled={isAddingAccount}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              追加
            </button>
          </div>

          <div className="space-y-3">
            {accounts.filter((a) => a.platform === "google").map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{account.accountName}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {account.accountId}
                  </p>
                  {account.lastSynced && (
                    <p className="text-xs text-muted-foreground">
                      最終同期: {new Date(account.lastSynced).toLocaleString("ja-JP")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {account.isActive ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <button
                    onClick={() => handleRemoveAccount(account.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {accounts.filter((a) => a.platform === "google").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Google広告アカウントが追加されていません
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6 bg-secondary/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          接続手順
        </h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>接続したいプラットフォームの「追加」ボタンをクリック</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>各プラットフォームの認証画面でログイン</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>必要な権限を許可</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>自動的にアカウントが追加されます</span>
          </li>
        </ol>
      </div>

      {/* Message Display */}
      {message && (
        <Alert 
          type={message.type} 
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="APIキーの設定方法"
        size="lg"
      >
        <div className="space-y-4">
          <Alert type="info">
            実際のデータを使用するには、以下の手順でAPIキーを設定してください。
          </Alert>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Meta広告の設定
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 ml-6">
                <li>1. <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a>にアクセス</li>
                <li>2. 新しいアプリを作成</li>
                <li>3. Marketing APIを追加</li>
                <li>4. App IDとApp Secretを取得</li>
                <li>5. .env.localファイルに設定</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                Google広告の設定
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 ml-6">
                <li>1. <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>にアクセス</li>
                <li>2. 新しいプロジェクトを作成</li>
                <li>3. Google Ads APIを有効化</li>
                <li>4. OAuth 2.0クライアントIDを作成</li>
                <li>5. Developer Tokenを取得</li>
                <li>6. .env.localファイルに設定</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-mono text-gray-700">
                # .env.local<br/>
                META_APP_ID=your_facebook_app_id<br/>
                META_APP_SECRET=your_facebook_app_secret<br/>
                GOOGLE_CLIENT_ID=your_google_client_id<br/>
                GOOGLE_CLIENT_SECRET=your_google_client_secret<br/>
                GOOGLE_DEVELOPER_TOKEN=your_developer_token
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowSetupModal(false)}
              className="btn-secondary"
            >
              閉じる
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}