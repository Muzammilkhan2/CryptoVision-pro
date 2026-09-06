import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';
import { TvlProtocol } from '@cryptovision/shared-types';

@Injectable()
export class DeFiLlamaClient {
  private readonly logger = new Logger(DeFiLlamaClient.name);
  private readonly baseUrl = 'https://api.llama.fi';

  constructor(private readonly redis: RedisService) {}

  async getTopProtocols(limit: number = 10): Promise<TvlProtocol[]> {
    const cacheKey = `defillama:protocols:top:${limit}`;
    const cached = await this.redis.get<TvlProtocol[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axios.get(`${this.baseUrl}/protocols`, { timeout: 6000 });
      const rawProtocols: any[] = res.data;

      // Filter and sort by TVL descending
      const sorted = rawProtocols
        .filter((p) => p.tvl && p.tvl > 0)
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, limit);

      const protocols: TvlProtocol[] = sorted.map((p) => ({
        id: p.slug || p.id,
        name: p.name,
        symbol: p.symbol || 'N/A',
        tvl: p.tvl,
        change24h: p.change_1d ? Number(p.change_1d.toFixed(2)) : 0,
        category: p.category || 'DeFi',
        chain: p.chain || 'Multi-Chain',
      }));

      // Cache TVL for 10 minutes
      await this.redis.set(cacheKey, protocols, 600);
      return protocols;
    } catch (error: any) {
      this.logger.warn(`DeFiLlama protocols fetch failed: ${error.message}. Returning fallback.`);
      return this.getFallbackProtocols().slice(0, limit);
    }
  }

  private getFallbackProtocols(): TvlProtocol[] {
    return [
      { id: 'lido', name: 'Lido', symbol: 'LDO', tvl: 34200000000, change24h: 1.4, category: 'Liquid Staking', chain: 'Ethereum' },
      { id: 'aave', name: 'Aave', symbol: 'AAVE', tvl: 12400000000, change24h: 3.2, category: 'Lending', chain: 'Multi-Chain' },
      { id: 'eigenlayer', name: 'EigenLayer', symbol: 'EIGEN', tvl: 11800000000, change24h: 0.8, category: 'Restaking', chain: 'Ethereum' },
      { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', tvl: 5800000000, change24h: -0.5, category: 'DEX', chain: 'Multi-Chain' },
      { id: 'maker', name: 'Maker (Sky)', symbol: 'MKR', tvl: 5400000000, change24h: 0.2, category: 'CDP/Lending', chain: 'Ethereum' },
      { id: 'curve', name: 'Curve DEX', symbol: 'CRV', tvl: 2100000000, change24h: -1.1, category: 'DEX', chain: 'Multi-Chain' },
    ];
  }
}
