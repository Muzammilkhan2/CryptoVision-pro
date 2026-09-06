import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { MarketGateway } from '../../gateways/market.gateway';
import { CoinGeckoClient } from '../integrations/coingecko.client';
import { WhaleStreamService } from '../integrations/whale-stream.service';
import { SentimentClient } from '../integrations/sentiment.client';

@Injectable()
export class MarketPollJob {
  private readonly logger = new Logger(MarketPollJob.name);

  constructor(
    private readonly marketGateway: MarketGateway,
    private readonly coingecko: CoinGeckoClient,
    private readonly whaleStream: WhaleStreamService,
    private readonly sentiment: SentimentClient,
  ) {}

  // Broadcast live spot tickers every 10 seconds
  @Interval(10000)
  async pollAndBroadcastTickers() {
    try {
      const tickers = await this.coingecko.getTopTickers();
      if (tickers && tickers.length > 0) {
        this.marketGateway.broadcastTickers(tickers);
      }
    } catch (e: any) {
      this.logger.debug(`Ticker broadcast error: ${e.message}`);
    }
  }

  // Broadcast whale alerts every 8 seconds
  @Interval(8000)
  async pollAndBroadcastWhales() {
    try {
      const tx = this.whaleStream.generateWhaleTransaction();
      this.marketGateway.broadcastWhaleTransaction(tx);
    } catch (e: any) {
      this.logger.debug(`Whale broadcast error: ${e.message}`);
    }
  }

  // Refresh sentiment every 5 minutes
  @Interval(300000)
  async pollAndBroadcastSentiment() {
    try {
      const sent = await this.sentiment.getFearGreed();
      if (sent) {
        this.marketGateway.broadcastSentiment(sent);
      }
    } catch (e: any) {
      this.logger.debug(`Sentiment broadcast error: ${e.message}`);
    }
  }
}
