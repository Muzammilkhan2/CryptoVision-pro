import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private memoryFallback = new Map<string, { value: string; expiresAt: number | null }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis unavailable, utilizing in-memory cache fallback');
            return null; // stop reconnecting automatically
          }
          return Math.min(times * 100, 2000);
        },
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message} (using fallback cache)`);
      });
    } catch (e: any) {
      this.logger.warn(`Failed to initialize Redis client: ${e.message}, falling back to memory`);
      this.client = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client && this.client.status === 'ready') {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        // fallback to memory on runtime error
      }
    }

    const item = this.memoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }
    return JSON.parse(item.value);
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.client && this.client.status === 'ready') {
      try {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // fallback to memory
      }
    }

    this.memoryFallback.set(key, {
      value: serialized,
      expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    if (this.client && this.client.status === 'ready') {
      try {
        await this.client.del(key);
      } catch (err) {}
    }
    this.memoryFallback.delete(key);
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
    this.memoryFallback.clear();
  }
}
