import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Header } from './components/layout/Header';
import { TickerBanner } from './components/layout/TickerBanner';
import { WhaleFeed } from './components/layout/WhaleFeed';
import { PriceCandleChart } from './components/charts/PriceCandleChart';
import { TVLBarChart } from './components/charts/TVLBarChart';
import { OnChainMetricsChart } from './components/charts/OnChainMetricsChart';
import { FearGreedGaugeChart } from './components/charts/FearGreedGaugeChart';
import { MarketCapTreemapChart } from './components/charts/MarketCapTreemapChart';
import { WatchlistManager } from './components/features/WatchlistManager';
import { AlertsManager } from './components/features/AlertsManager';
import { PortfolioManager } from './components/features/PortfolioManager';
import { AuthModal } from './components/auth/AuthModal';
import { useAppStore } from './store/useAppStore';
import { useMarketSocket } from './hooks/useMarketSocket';
import {
  TickerItem,
  MarketCandlesPayload,
  TvlProtocol,
  OnChainMetricsPayload,
  WhaleTx,
  FearGreedData,
  ApiResponse,
} from '@cryptovision/shared-types';

const API_BASE = '/api/v1';

export const App: React.FC = () => {
  const { currentSymbol, currentTimeframe, isWhaleFeedOpen, activeTab } = useAppStore();

  // Enable live WebSocket subscriptions to price tickers, whales, and sentiment
  useMarketSocket();

  // Queries
  const { data: tickers, isLoading: tickersLoading } = useQuery<TickerItem[]>({
    queryKey: ['tickers'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<TickerItem[]>>(`${API_BASE}/market/tickers`);
      return res.data.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: candles, isLoading: candlesLoading } = useQuery<MarketCandlesPayload>({
    queryKey: ['candles', currentSymbol, currentTimeframe],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<MarketCandlesPayload>>(
        `${API_BASE}/market/candles?symbol=${currentSymbol}&interval=${currentTimeframe}`,
      );
      return res.data.data as MarketCandlesPayload;
    },
    refetchInterval: 15000,
  });

  const { data: tvl, isLoading: tvlLoading } = useQuery<TvlProtocol[]>({
    queryKey: ['tvl'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<TvlProtocol[]>>(`${API_BASE}/market/defi/tvl`);
      return res.data.data || [];
    },
    refetchInterval: 60000,
  });

  const { data: onChain, isLoading: onChainLoading } = useQuery<OnChainMetricsPayload>({
    queryKey: ['onChain'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<OnChainMetricsPayload>>(`${API_BASE}/market/onchain/metrics`);
      return res.data.data as OnChainMetricsPayload;
    },
    refetchInterval: 60000,
  });

  const { data: fearGreed, isLoading: fearGreedLoading } = useQuery<FearGreedData>({
    queryKey: ['fearGreed'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<FearGreedData>>(`${API_BASE}/market/sentiment/fear-greed`);
      return res.data.data as FearGreedData;
    },
    refetchInterval: 30000,
  });

  const { data: whaleTxs, isLoading: whaleLoading } = useQuery<WhaleTx[]>({
    queryKey: ['whaleTxs'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<WhaleTx[]>>(`${API_BASE}/market/whale/transactions`);
      return res.data.data || [];
    },
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-slate-100 font-sans selection:bg-neon-cyan/20 selection:text-neon-cyan">
      {/* Ticker Banner */}
      <TickerBanner tickers={tickers || []} isLoading={tickersLoading} />

      {/* Main Header */}
      <Header />

      {/* Dashboard Body */}
      <main className="flex-1 px-4 lg:px-8 py-6">
        {/* Tab 1: Market Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6 transition-all duration-300">
              <PriceCandleChart data={candles} isLoading={candlesLoading} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TVLBarChart data={tvl} isLoading={tvlLoading} />
                <OnChainMetricsChart data={onChain} isLoading={onChainLoading} />
                <FearGreedGaugeChart data={fearGreed} isLoading={fearGreedLoading} />
                <MarketCapTreemapChart data={tickers} isLoading={tickersLoading} />
              </div>
            </div>

            {/* Whale Stream Sidebar */}
            {isWhaleFeedOpen && (
              <div className="w-full lg:w-96 flex-shrink-0 h-[750px] lg:h-auto lg:sticky lg:top-24">
                <WhaleFeed transactions={whaleTxs || []} isLoading={whaleLoading} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Watchlists */}
        {activeTab === 'watchlist' && (
          <WatchlistManager tickers={tickers || []} />
        )}

        {/* Tab 3: Price Alerts */}
        {activeTab === 'alerts' && (
          <AlertsManager />
        )}

        {/* Tab 4: Portfolio Tracking */}
        {activeTab === 'portfolio' && (
          <PortfolioManager />
        )}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};
