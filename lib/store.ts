import { create } from 'zustand';

export interface AdAccount {
  id: string;
  platform: 'meta' | 'google';
  accountId: string;
  accountName: string;
  isActive: boolean;
  lastSynced?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  user: User | null;
  accounts: AdAccount[];
  selectedAccount: AdAccount | null;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setAccounts: (accounts: AdAccount[]) => void;
  addAccount: (account: AdAccount) => void;
  removeAccount: (accountId: string) => void;
  selectAccount: (account: AdAccount | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, account]
  })),
  removeAccount: (accountId) => set((state) => ({
    accounts: state.accounts.filter(a => a.id !== accountId),
    selectedAccount: state.selectedAccount?.id === accountId ? null : state.selectedAccount
  })),
  selectAccount: (account) => set({ selectedAccount: account }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ 
    user: null, 
    accounts: [], 
    selectedAccount: null 
  }),
}));