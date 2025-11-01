"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AccountManager } from "./AccountManager";
import { AnalyticsView } from "./AnalyticsView";
import { Sidebar } from "./Sidebar";
import { useRouter } from "next/navigation";
import { BarChart3, Settings, LogOut, Loader2 } from "lucide-react";

export function Dashboard() {
  const { user, selectedAccount, logout, setUser } = useStore();
  const router = useRouter();
  const [activeView, setActiveView] = useState<"analytics" | "accounts">("analytics");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [user, router, setUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      logout();
      localStorage.removeItem("token");
      router.push("/");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-auto">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {activeView === "analytics" ? "分析ダッシュボード" : "アカウント管理"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user.name} としてログイン中
              </p>
            </div>
            <div className="flex items-center gap-4">
              {selectedAccount && (
                <div className="text-sm">
                  <span className="text-muted-foreground">選択中:</span>
                  <span className="ml-2 font-medium">
                    {selectedAccount.accountName} ({selectedAccount.platform === 'meta' ? 'Meta' : 'Google'})
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeView === "analytics" ? (
            selectedAccount ? (
              <AnalyticsView account={selectedAccount} />
            ) : (
              <div className="card p-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">アカウントを選択してください</h2>
                <p className="text-muted-foreground mb-4">
                  分析を開始するには、左側のメニューからアカウントを選択するか、
                  アカウント管理画面で新しいアカウントを追加してください。
                </p>
                <button
                  onClick={() => setActiveView("accounts")}
                  className="btn-primary"
                >
                  アカウントを追加
                </button>
              </div>
            )
          ) : (
            <AccountManager />
          )}
        </div>
      </main>
    </div>
  );
}