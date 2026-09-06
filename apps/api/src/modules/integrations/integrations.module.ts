import { Module } from '@nestjs/common';
import { CoinGeckoClient } from './coingecko.client';
import { DeFiLlamaClient } from './defillama.client';
import { SentimentClient } from './sentiment.client';
import { WhaleStreamService } from './whale-stream.service';

@Module({
  providers: [CoinGeckoClient, DeFiLlamaClient, SentimentClient, WhaleStreamService],
  exports: [CoinGeckoClient, DeFiLlamaClient, SentimentClient, WhaleStreamService],
})
export class IntegrationsModule {}
