import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MarketDataService } from './market-data.service';
import { Timeframe } from '@cryptovision/shared-types';

@ApiTags('Market Data')
@Controller('market')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('tickers')
  @ApiOperation({ summary: 'Get live spot prices and 24h ticker data' })
  getSpotTickers() {
    return this.marketDataService.getSpotTickers();
  }

  @Get('candles')
  @ApiOperation({ summary: 'Get OHLCV candlestick time series data' })
  @ApiQuery({ name: 'symbol', required: false, example: 'BTC' })
  @ApiQuery({ name: 'interval', required: false, enum: ['1H', '4H', '1D', '1W', '1M'] })
  @ApiQuery({ name: 'limit', required: false, example: 60 })
  getCandles(
    @Query('symbol') symbol?: string,
    @Query('interval') interval?: Timeframe,
    @Query('limit') limit?: number,
  ) {
    return this.marketDataService.getCandles(symbol, interval, limit ? Number(limit) : undefined);
  }

  @Get('defi/tvl')
  @ApiOperation({ summary: 'Get DeFi protocol TVL rankings' })
  getTvl(@Query('limit') limit?: number) {
    return this.marketDataService.getTvlRankings(limit ? Number(limit) : undefined);
  }

  @Get('onchain/metrics')
  @ApiOperation({ summary: 'Get on-chain transactions and active addresses' })
  getOnChain(@Query('chain') chain?: string, @Query('days') days?: number) {
    return this.marketDataService.getOnChainMetrics(chain, days ? Number(days) : undefined);
  }

  @Get('whale/transactions')
  @ApiOperation({ summary: 'Get large and whale transactions feed' })
  getWhales(@Query('limit') limit?: number) {
    return this.marketDataService.getWhaleTransactions(limit ? Number(limit) : undefined);
  }

  @Get('sentiment/fear-greed')
  @ApiOperation({ summary: 'Get Fear & Greed sentiment index' })
  getFearGreed() {
    return this.marketDataService.getFearGreed();
  }
}
