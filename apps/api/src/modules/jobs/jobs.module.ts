import { Module } from '@nestjs/common';
import { MarketPollJob } from './market-poll.job';
import { MarketGateway } from '../../gateways/market.gateway';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  providers: [MarketPollJob, MarketGateway],
  exports: [MarketGateway],
})
export class JobsModule {}
