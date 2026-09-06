import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoinGeckoClient } from '../integrations/coingecko.client';
import { CreatePositionDto } from './dto/create-position.dto';
import { PortfolioPosition } from '@cryptovision/shared-types';

@Injectable()
export class PortfolioService {
  private devPositions: Map<string, any[]> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly coingecko: CoinGeckoClient,
  ) {}

  async getPortfolio(userId: string) {
    // Get live tickers to compute mark-to-market prices
    const tickers = await this.coingecko.getTopTickers();
    const priceMap = new Map<string, number>();
    tickers.forEach((t) => priceMap.set(t.symbol, t.price));

    let rawPositions: any[];
    try {
      rawPositions = await this.prisma.position.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      rawPositions = this.devPositions.get(userId) || [
        { id: 'pos_1', symbol: 'BTC', quantity: 0.65, costBasis: 62500, createdAt: new Date() },
        { id: 'pos_2', symbol: 'ETH', quantity: 4.2, costBasis: 3100, createdAt: new Date() },
        { id: 'pos_3', symbol: 'SOL', quantity: 45, costBasis: 140, createdAt: new Date() },
      ];
      this.devPositions.set(userId, rawPositions);
    }

    let totalValueUsd = 0;
    let totalCostUsd = 0;

    const positions: PortfolioPosition[] = rawPositions.map((p) => {
      const sym = p.symbol.toUpperCase();
      const currentPrice = priceMap.get(sym) || (sym === 'BTC' ? 68000 : sym === 'ETH' ? 3500 : sym === 'SOL' ? 165 : 25);
      const qty = Number(p.quantity);
      const cost = Number(p.costBasis);

      const marketValue = qty * currentPrice;
      const costBasisTotal = qty * cost;
      const unrealizedPnl = marketValue - costBasisTotal;

      totalValueUsd += marketValue;
      totalCostUsd += costBasisTotal;

      return {
        id: p.id,
        symbol: sym,
        quantity: qty,
        costBasis: cost,
        currentPrice,
        unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString(),
      };
    });

    const totalUnrealizedPnl = totalValueUsd - totalCostUsd;
    const totalReturnPercentage = totalCostUsd > 0 ? (totalUnrealizedPnl / totalCostUsd) * 100 : 0;

    return {
      totalValueUsd: Number(totalValueUsd.toFixed(2)),
      totalCostUsd: Number(totalCostUsd.toFixed(2)),
      totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
      totalReturnPercentage: Number(totalReturnPercentage.toFixed(2)),
      positions,
    };
  }

  async addPosition(userId: string, dto: CreatePositionDto) {
    try {
      const created = await this.prisma.position.create({
        data: {
          userId,
          symbol: dto.symbol.toUpperCase(),
          quantity: dto.quantity,
          costBasis: dto.costBasis,
        },
      });
      return created;
    } catch (e) {
      const newPos = {
        id: `pos_${Date.now()}`,
        symbol: dto.symbol.toUpperCase(),
        quantity: dto.quantity,
        costBasis: dto.costBasis,
        createdAt: new Date(),
      };
      const list = this.devPositions.get(userId) || [];
      list.unshift(newPos);
      this.devPositions.set(userId, list);
      return newPos;
    }
  }

  async removePosition(userId: string, id: string) {
    try {
      await this.prisma.position.deleteMany({ where: { id, userId } });
    } catch (e) {
      const list = this.devPositions.get(userId) || [];
      this.devPositions.set(userId, list.filter((p) => p.id !== id));
    }
    return { success: true };
  }
}
