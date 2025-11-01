"use client";

import { useStore } from "@/lib/store";
import {
  BarChart3,
  Settings,
  Plus,
  Facebook,
  Globe,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
  Home,
} from "lucide-react";

interface SidebarProps {
  activeView: "analytics" | "accounts";
  onViewChange: (view: "analytics" | "accounts") => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const { accounts, selectedAccount, selectAccount } = useStore();

  const metaAccounts = accounts.filter((a) => a.platform === "meta");
  const googleAccounts = accounts.filter((a) => a.platform === "google");

  return (
    <aside className="w-72 bg-gradient-to-b from-card to-card/95 border-r flex flex-col h-screen shadow-lg">
      {/* ロゴとブランド */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-md">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Ad Analytics
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </h2>
            <p className="text-xs text-muted-foreground">広告分析ツール</p>
          </div>
        </div>
      </div>

      {/* メインナビゲーション */}
      <nav className="flex-1 p-4 overflow-auto">
        <div className="space-y-2 mb-6">
          <button
            onClick={() => onViewChange("analytics")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeView === "analytics"
                ? "bg-primary text-primary-foreground shadow-md transform scale-[1.02]"
                : "hover:bg-secondary/80 text-foreground hover:shadow-sm"
            }`}
          >
            <BarChart3 className={`h-5 w-5 ${activeView === "analytics" ? "" : "text-muted-foreground"}`} />
            <span className="font-medium">分析ダッシュボード</span>
            {activeView === "analytics" && (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
          <button
            onClick={() => onViewChange("accounts")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
              activeView === "accounts"
                ? "bg-primary text-primary-foreground shadow-md transform scale-[1.02]"
                : "hover:bg-secondary/80 text-foreground hover:shadow-sm"
            }`}
          >
            <Settings className={`h-5 w-5 ${activeView === "accounts" ? "" : "text-muted-foreground"}`} />
            <span className="font-medium">アカウント管理</span>
            {activeView === "accounts" && (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
        </div>

        {/* アカウントリスト */}
        <div className="space-y-4">
          {/* Meta広告アカウント */}
          {metaAccounts.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Meta広告アカウント
                </h3>
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {metaAccounts.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {metaAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      selectAccount(account);
                      onViewChange("analytics");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all duration-200 group ${
                      selectedAccount?.id === account.id
                        ? "bg-blue-50 border-2 border-blue-300 shadow-sm"
                        : "hover:bg-secondary/60 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-md ${
                        selectedAccount?.id === account.id 
                          ? "bg-blue-100" 
                          : "bg-secondary"
                      }`}>
                        <Facebook className={`h-3.5 w-3.5 ${
                          selectedAccount?.id === account.id 
                            ? "text-blue-600" 
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <span className={`truncate font-medium ${
                        selectedAccount?.id === account.id 
                          ? "text-blue-900" 
                          : "text-foreground"
                      }`}>
                        {account.accountName}
                      </span>
                    </div>
                    {selectedAccount?.id === account.id && (
                      <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Google広告アカウント */}
          {googleAccounts.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Globe className="h-4 w-4 text-green-600" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Google広告アカウント
                </h3>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {googleAccounts.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {googleAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      selectAccount(account);
                      onViewChange("analytics");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all duration-200 group ${
                      selectedAccount?.id === account.id
                        ? "bg-green-50 border-2 border-green-300 shadow-sm"
                        : "hover:bg-secondary/60 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-md ${
                        selectedAccount?.id === account.id 
                          ? "bg-green-100" 
                          : "bg-secondary"
                      }`}>
                        <Globe className={`h-3.5 w-3.5 ${
                          selectedAccount?.id === account.id 
                            ? "text-green-600" 
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <span className={`truncate font-medium ${
                        selectedAccount?.id === account.id 
                          ? "text-green-900" 
                          : "text-foreground"
                      }`}>
                        {account.accountName}
                      </span>
                    </div>
                    {selectedAccount?.id === account.id && (
                      <ChevronRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* アカウントが無い場合 */}
          {accounts.length === 0 && (
            <div className="text-center py-8 px-4 animate-fade-in">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border-2 border-dashed border-muted-foreground/20">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  アカウントが追加されていません
                </p>
                <button
                  onClick={() => onViewChange("accounts")}
                  className="btn-primary text-sm flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  アカウントを追加
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t bg-secondary/30">
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}