import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { PriceAlert } from '@cryptovision/shared-types';

@Injectable()
export class AlertsService {
  private devAlerts: Map<string, PriceAlert[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const alerts = await this.prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return alerts.map((a) => ({
        id: a.id,
        symbol: a.symbol,
        condition: a.condition as any,
        threshold: a.threshold,
        channel: a.channel as any,
        active: a.active,
        createdAt: a.createdAt.toISOString(),
        lastFiredAt: a.lastFiredAt ? a.lastFiredAt.toISOString() : undefined,
      }));
    } catch (e) {
      let list = this.devAlerts.get(userId);
      if (!list) {
        list = [
          {
            id: 'alrt_1',
            symbol: 'BTC',
            condition: 'price_above',
            threshold: 70000,
            channel: 'email',
            active: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'alrt_2',
            symbol: 'ETH',
            condition: 'price_above',
            threshold: 3800,
            channel: 'push',
            active: true,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'alrt_3',
            symbol: 'SOL',
            condition: 'price_below',
            threshold: 150,
            channel: 'email',
            active: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        this.devAlerts.set(userId, list);
      }
      return list;
    }
  }

  async createAlert(userId: string, dto: CreateAlertDto): Promise<PriceAlert> {
    try {
      const created = await this.prisma.alert.create({
        data: {
          userId,
          symbol: dto.symbol.toUpperCase(),
          condition: dto.condition,
          threshold: dto.threshold,
          channel: dto.channel || 'email',
          active: true,
        },
      });
      return {
        id: created.id,
        symbol: created.symbol,
        condition: created.condition as any,
        threshold: created.threshold,
        channel: created.channel as any,
        active: created.active,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (e) {
      const newAlert: PriceAlert = {
        id: `alrt_${Date.now()}`,
        symbol: dto.symbol.toUpperCase(),
        condition: dto.condition,
        threshold: dto.threshold,
        channel: dto.channel || 'email',
        active: true,
        createdAt: new Date().toISOString(),
      };
      const list = this.devAlerts.get(userId) || [];
      list.unshift(newAlert);
      this.devAlerts.set(userId, list);
      return newAlert;
    }
  }

  async toggleAlert(userId: string, id: string): Promise<PriceAlert> {
    try {
      const alert = await this.prisma.alert.findFirst({ where: { id, userId } });
      if (!alert) throw new NotFoundException('Alert not found');

      const updated = await this.prisma.alert.update({
        where: { id },
        data: { active: !alert.active },
      });
      return {
        id: updated.id,
        symbol: updated.symbol,
        condition: updated.condition as any,
        threshold: updated.threshold,
        channel: updated.channel as any,
        active: updated.active,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (e) {
      const list = this.devAlerts.get(userId) || [];
      const item = list.find((a) => a.id === id);
      if (item) {
        item.active = !item.active;
        return item;
      }
      throw new NotFoundException('Alert not found');
    }
  }

  async deleteAlert(userId: string, id: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.alert.deleteMany({ where: { id, userId } });
    } catch (e) {
      const list = this.devAlerts.get(userId) || [];
      this.devAlerts.set(
        userId,
        list.filter((a) => a.id !== id),
      );
    }
    return { success: true };
  }
}
