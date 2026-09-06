import { create } from 'zustand';
import { Timeframe, UserProfile } from '@cryptovision/shared-types';

export type DashboardTab = 'overview' | 'watchlist' | 'alerts' | 'portfolio';

interface AppStoreState {
  currentSymbol: string;
  currentTimeframe: Timeframe;
  currentCurrency: string;
  isWhaleFeedOpen: boolean;
  activeTab: DashboardTab;
  isAuthModalOpen: boolean;
  user: UserProfile | null;
  token: string | null;

  setCurrentSymbol: (symbol: string) => void;
  setCurrentTimeframe: (timeframe: Timeframe) => void;
  setCurrentCurrency: (currency: string) => void;
  toggleWhaleFeed: () => void;
  setActiveTab: (tab: DashboardTab) => void;
  setAuthModalOpen: (open: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  currentSymbol: 'BTC',
  currentTimeframe: '1D',
  currentCurrency: 'USD',
  isWhaleFeedOpen: true,
  activeTab: 'overview',
  isAuthModalOpen: false,
  user: null,
  token: null,

  setCurrentSymbol: (symbol) => set({ currentSymbol: symbol }),
  setCurrentTimeframe: (timeframe) => set({ currentTimeframe: timeframe }),
  setCurrentCurrency: (currency) => set({ currentCurrency: currency }),
  toggleWhaleFeed: () => set((state) => ({ isWhaleFeedOpen: !state.isWhaleFeedOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
