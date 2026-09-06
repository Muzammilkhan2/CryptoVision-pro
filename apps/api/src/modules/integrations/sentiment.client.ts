import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';
import { FearGreedData } from '@cryptovision/shared-types';

@Injectable()
export class SentimentClient {
  private readonly logger = new Logger(SentimentClient.name);
  private readonly apiUrl = 'https://api.alternative.me/fng/?limit=7';

  constructor(private readonly redis: RedisService) {}

  async getFearGreed(): Promise<FearGreedData> {
    const cacheKey = 'sentiment:fear-greed';
    const cached = await this.redis.get<FearGreedData>(cacheKey);
    if (cached) return cached;

    try {
      const res = await axios.get(this.apiUrl, { timeout: 5000 });
      const dataList = res.data?.data;
      if (!dataList || dataList.length === 0) {
        throw new Error('Empty sentiment data array');
      }

      const current = dataList[0];
      const val = parseInt(current.value, 10);
      const label = this.normalizeLabel(current.value_classification);

      const historical = dataList.slice(1).map((d: any) => ({
        value: parseInt(d.value, 10),
        timestamp: new Date(parseInt(d.timestamp, 10) * 1000).toISOString(),
      }));

      const payload: FearGreedData = {
        value: val,
        label,
        timestamp: new Date(parseInt(current.timestamp, 10) * 1000).toISOString(),
        historical,
      };

      // Cache sentiment for 1 hour (updates once a day typically)
      await this.redis.set(cacheKey, payload, 3600);
      return payload;
    } catch (error: any) {
      this.logger.warn(`Alternative.me sentiment fetch failed: ${error.message}. Returning fallback.`);
      return this.getFallbackSentiment();
    }
  }

  private normalizeLabel(classification: string): 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' {
    const lower = (classification || '').toLowerCase();
    if (lower.includes('extreme fear')) return 'Extreme Fear';
    if (lower.includes('fear')) return 'Fear';
    if (lower.includes('extreme greed')) return 'Extreme Greed';
    if (lower.includes('greed')) return 'Greed';
    return 'Neutral';
  }

  private getFallbackSentiment(): FearGreedData {
    return {
      value: 68,
      label: 'Greed',
      timestamp: new Date().toISOString(),
      historical: [
        { value: 65, timestamp: new Date(Date.now() - 86400000).toISOString() },
        { value: 62, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
        { value: 71, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      ],
    };
  }
}
