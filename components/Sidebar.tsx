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
    <aside className="w-64 bg-card border-r flex flex-col h-screen">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Ad Analytics
        </h2>
      </div>

      <nav className="flex-1 p-4 overflow-auto">
        <div className="space-y-1 mb-6">
          <button
            onClick={() => onViewChange("analytics")}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeView === "analytics"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            分析ダッシュボード
          </button>
          <button
            onClick={() => onViewChange("accounts")}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeView === "accounts"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            <Settings className="h-4 w-4" />
            アカウント管理
          </button>
        </div>

        <div className="space-y-4">
          {metaAccounts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Facebook className="h-3 w-3" />
                Meta広告アカウント
              </h3>
              <div className="space-y-1">
                {metaAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      selectAccount(account);
                      onViewChange("analytics");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                      selectedAccount?.id === account.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="truncate">{account.accountName}</span>
                    {selectedAccount?.id === account.id && (
                      <ChevronRight className="h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {googleAccounts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Google広告アカウント
              </h3>
              <div className="space-y-1">
                {googleAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      selectAccount(account);
                      onViewChange("analytics");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                      selectedAccount?.id === account.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="truncate">{account.accountName}</span>
                    {selectedAccount?.id === account.id && (
                      <ChevronRight className="h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {accounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">
                アカウントが追加されていません
              </p>
              <button
                onClick={() => onViewChange("accounts")}
                className="btn-primary text-sm flex items-center gap-1 mx-auto"
              >
                <Plus className="h-3 w-3" />
                アカウントを追加
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}