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
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-auto">
        <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    {activeView === "analytics" ? "分析ダッシュボード" : "アカウント管理"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground">
                      {user.name} としてログイン中
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedAccount && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className={`h-2 w-2 rounded-full ${
                      selectedAccount.platform === 'meta' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="text-sm">
                      <span className="text-muted-foreground text-xs">選択中:</span>
                      <span className="ml-2 font-semibold">
                        {selectedAccount.accountName}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({selectedAccount.platform === 'meta' ? 'Meta' : 'Google'})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {activeView === "analytics" ? (
            selectedAccount ? (
              <AnalyticsView account={selectedAccount} />
            ) : (
              <div className="card p-12 text-center max-w-2xl mx-auto animate-fade-in">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">アカウントを選択してください</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  分析を開始するには、左側のメニューからアカウントを選択するか、
                  <br />
                  アカウント管理画面で新しいアカウントを追加してください。
                </p>
                <button
                  onClick={() => setActiveView("accounts")}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Settings className="h-4 w-4" />
                  アカウント管理へ移動
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