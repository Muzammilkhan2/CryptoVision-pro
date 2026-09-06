import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchlistDto, AddSymbolDto } from './dto/create-watchlist.dto';
import { Watchlist } from '@cryptovision/shared-types';

@Injectable()
export class WatchlistsService {
  // In-memory fallback for local dev when DB is disconnected
  private devWatchlists: Map<string, any[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    try {
      const lists = await this.prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return lists.map((l) => ({
        id: l.id,
        name: l.name,
        symbols: l.symbols,
        createdAt: l.createdAt.toISOString(),
      }));
    } catch (e) {
      let lists = this.devWatchlists.get(userId);
      if (!lists) {
        lists = [
          {
            id: 'wl_default',
            name: 'Primary Watchlist',
            symbols: ['BTC', 'ETH', 'SOL', 'AVAX'],
            createdAt: new Date().toISOString(),
          },
        ];
        this.devWatchlists.set(userId, lists);
      }
      return lists;
    }
  }

  async createWatchlist(userId: string, dto: CreateWatchlistDto): Promise<Watchlist> {
    const symbols = dto.symbols || ['BTC', 'ETH'];
    try {
      const created = await this.prisma.watchlist.create({
        data: {
          userId,
          name: dto.name,
          symbols,
        },
      });
      return {
        id: created.id,
        name: created.name,
        symbols: created.symbols,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (e) {
      const newWl = {
        id: `wl_${Date.now()}`,
        name: dto.name,
        symbols,
        createdAt: new Date().toISOString(),
      };
      const userLists = this.devWatchlists.get(userId) || [];
      userLists.unshift(newWl);
      this.devWatchlists.set(userId, userLists);
      return newWl;
    }
  }

  async addSymbol(userId: string, watchlistId: string, dto: AddSymbolDto): Promise<Watchlist> {
    const sym = dto.symbol.toUpperCase();
    try {
      const wl = await this.prisma.watchlist.findFirst({
        where: { id: watchlistId, userId },
      });
      if (!wl) throw new NotFoundException('Watchlist not found');

      if (!wl.symbols.includes(sym)) {
        const updated = await this.prisma.watchlist.update({
          where: { id: watchlistId },
          data: { symbols: [...wl.symbols, sym] },
        });
        return {
          id: updated.id,
          name: updated.name,
          symbols: updated.symbols,
          createdAt: updated.createdAt.toISOString(),
        };
      }
      return {
        id: wl.id,
        name: wl.name,
        symbols: wl.symbols,
        createdAt: wl.createdAt.toISOString(),
      };
    } catch (e) {
      const lists = this.devWatchlists.get(userId) || [];
      const item = lists.find((l) => l.id === watchlistId) || lists[0];
      if (item && !item.symbols.includes(sym)) {
        item.symbols.push(sym);
      }
      return item || { id: watchlistId, name: 'Default', symbols: [sym], createdAt: new Date().toISOString() };
    }
  }

  async removeSymbol(userId: string, watchlistId: string, symbol: string): Promise<Watchlist> {
    const sym = symbol.toUpperCase();
    try {
      const wl = await this.prisma.watchlist.findFirst({
        where: { id: watchlistId, userId },
      });
      if (!wl) throw new NotFoundException('Watchlist not found');

      const updated = await this.prisma.watchlist.update({
        where: { id: watchlistId },
        data: { symbols: wl.symbols.filter((s) => s !== sym) },
      });
      return {
        id: updated.id,
        name: updated.name,
        symbols: updated.symbols,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (e) {
      const lists = this.devWatchlists.get(userId) || [];
      const item = lists.find((l) => l.id === watchlistId) || lists[0];
      if (item) {
        item.symbols = item.symbols.filter((s: string) => s !== sym);
      }
      return item;
    }
  }
}
