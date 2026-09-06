import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { HealthModule } from './modules/health/health.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { AuthModule } from './modules/auth/auth.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { WatchlistsModule } from './modules/watchlists/watchlists.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'dist'),
    }),
    PrismaModule,
    RedisModule,
    IntegrationsModule,
    HealthModule,
    MarketDataModule,
    AuthModule,
    JobsModule,
    WatchlistsModule,
    AlertsModule,
    PortfolioModule,
  ],
})
export class AppModule {}
