import { Injectable } from '@nestjs/common';
import { WhaleTx } from '@cryptovision/shared-types';

@Injectable()
export class WhaleStreamService {
  private recentTransactions: WhaleTx[] = [];

  constructor() {
    this.seedInitialTransactions();
  }

  getRecentTransactions(limit: number = 20): WhaleTx[] {
    return this.recentTransactions.slice(0, limit);
  }

  generateWhaleTransaction(): WhaleTx {
    const coins = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC'];
    const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];
    const currency = coins[Math.floor(Math.random() * coins.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const usdValue = Math.floor(1200000 + Math.random() * 35000000);
    const isLarge = usdValue > 10000000;
    const rate = currency === 'BTC' ? 68000 : currency === 'ETH' ? 3500 : currency === 'SOL' ? 160 : 1;

    const tx: WhaleTx = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      address: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
      type,
      currency,
      amount: Number((usdValue / rate).toFixed(2)),
      usdValue,
      isLarge,
      occurredAt: new Date().toISOString(),
    };

    this.recentTransactions.unshift(tx);
    if (this.recentTransactions.length > 100) {
      this.recentTransactions.pop();
    }

    return tx;
  }

  private seedInitialTransactions() {
    for (let i = 0; i < 20; i++) {
      this.generateWhaleTransaction();
    }
  }
}
