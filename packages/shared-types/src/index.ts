// API Response Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp?: string;
  };
}

// User & Auth Types
export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// Market Data & Candlestick
export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M';

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketCandlesPayload {
  symbol: string;
  interval: Timeframe;
  candles: CandleData[];
}

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
}

// DeFi & TVL
export interface TvlProtocol {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
  change24h: number;
  category: string;
  chain: string;
}

// On-Chain Metrics
export interface OnChainMetricPoint {
  timestamp: string;
  txVolumeUsd: number;
  activeAddresses: number;
  networkFeeUsd?: number;
}

export interface OnChainMetricsPayload {
  chain: string;
  metrics: OnChainMetricPoint[];
}

// Whale Transactions
export type TransactionType = 'buy' | 'sell' | 'transfer';

export interface WhaleTx {
  id: string;
  txHash: string;
  address: string;
  type: TransactionType;
  currency: string;
  amount: number;
  usdValue: number;
  isLarge: boolean;
  occurredAt: string;
}

// Sentiment & Fear/Greed
export interface FearGreedData {
  value: number;
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: string;
  historical?: { value: number; timestamp: string }[];
}

// Watchlist & Alerts
export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export type AlertCondition = 'price_above' | 'price_below' | 'volume_spike' | 'pct_change';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  threshold: number;
  channel: 'email' | 'push' | 'webhook';
  active: boolean;
  createdAt: string;
  lastFiredAt?: string;
}

// Portfolio
export interface PortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  costBasis: number;
  currentPrice?: number;
  unrealizedPnl?: number;
  createdAt: string;
}
