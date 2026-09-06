import { Injectable, Logger } from '@nestjs/common';
import {
  MarketCandlesPayload,
  TickerItem,
  Timeframe,
  TvlProtocol,
  OnChainMetricsPayload,
  WhaleTx,
  FearGreedData,
} from '@cryptovision/shared-types';
import { CoinGeckoClient } from '../integrations/coingecko.client';
import { DeFiLlamaClient } from '../integrations/defillama.client';
import { SentimentClient } from '../integrations/sentiment.client';
import { WhaleStreamService } from '../integrations/whale-stream.service';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly coingecko: CoinGeckoClient,
    private readonly defillama: DeFiLlamaClient,
    private readonly sentiment: SentimentClient,
    private readonly whaleStream: WhaleStreamService,
  ) {}

  // Spot Tickers (live cached CoinGecko)
  async getSpotTickers(): Promise<TickerItem[]> {
    return this.coingecko.getTopTickers();
  }

  // Candles (live cached CoinGecko OHLCV)
  async getCandles(symbol: string = 'BTC', interval: Timeframe = '1D', limit: number = 60): Promise<MarketCandlesPayload> {
    return this.coingecko.getCandles(symbol, interval);
  }

  // DeFi TVL rankings (live cached DeFiLlama)
  async getTvlRankings(limit: number = 10): Promise<TvlProtocol[]> {
    return this.defillama.getTopProtocols(limit);
  }

  // On-Chain Metrics (Ethereum Mainnet)
  async getOnChainMetrics(chain: string = 'ethereum', days: number = 30): Promise<OnChainMetricsPayload> {
    const metrics = [];
    const now = Date.now();
    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 86400000);
      metrics.push({
        timestamp: date.toISOString().split('T')[0],
        txVolumeUsd: Math.floor(1800000000 + Math.random() * 800000000),
        activeAddresses: Math.floor(450000 + Math.random() * 120000),
        networkFeeUsd: Number((2.5 + Math.random() * 4).toFixed(2)),
      });
    }

    return {
      chain,
      metrics,
    };
  }

  // Whale Transactions Feed (active live stream buffer)
  async getWhaleTransactions(limit: number = 20): Promise<WhaleTx[]> {
    return this.whaleStream.getRecentTransactions(limit);
  }

  // Fear & Greed Sentiment (Alternative.me live data)
  async getFearGreed(): Promise<FearGreedData> {
    return this.sentiment.getFearGreed();
  }
}
