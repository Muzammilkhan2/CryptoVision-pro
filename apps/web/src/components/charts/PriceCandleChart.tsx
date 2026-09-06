import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { MarketCandlesPayload } from '@cryptovision/shared-types';
import { formatCurrency } from '../../utils/formatters';

interface PriceCandleChartProps {
  data?: MarketCandlesPayload;
  isLoading?: boolean;
}

export const PriceCandleChart: React.FC<PriceCandleChartProps> = ({ data, isLoading }) => {
  const option = useMemo(() => {
    if (!data || !data.candles || data.candles.length === 0) return {};

    const dates = data.candles.map((c) => {
      const d = new Date(c.timestamp);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    });

    const ohlc = data.candles.map((c) => [c.open, c.close, c.low, c.high]);
    const volumes = data.candles.map((c) => c.volume);

    return {
      backgroundColor: 'transparent',
      animation: true,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', lineStyle: { color: 'rgba(0, 240, 255, 0.4)' } },
        backgroundColor: 'rgba(17, 20, 37, 0.95)',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        textStyle: { color: '#F1F5F9', fontFamily: 'JetBrains Mono' },
      },
      grid: [
        { left: '3%', right: '3%', top: '10%', height: '58%' },
        { left: '3%', right: '3%', top: '74%', height: '18%' },
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: true,
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
          axisLabel: { color: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' },
          splitLine: { show: false },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: dates,
          axisLabel: { show: false },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          scale: true,
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
          axisLabel: {
            color: '#94A3B8',
            fontSize: 10,
            fontFamily: 'JetBrains Mono',
            formatter: (v: number) => formatCurrency(v, 'USD', true),
          },
        },
        {
          scale: true,
          gridIndex: 1,
          splitLine: { show: false },
          axisLabel: { show: false },
        },
      ],
      series: [
        {
          name: 'OHLC',
          type: 'candlestick',
          data: ohlc,
          itemStyle: {
            color: '#00FF66',
            color0: '#FF3366',
            borderColor: '#00FF66',
            borderColor0: '#FF3366',
          },
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes,
          itemStyle: {
            color: (params: any) => {
              const candle = data.candles[params.dataIndex];
              return candle && candle.close >= candle.open
                ? 'rgba(0, 255, 102, 0.35)'
                : 'rgba(255, 51, 102, 0.35)';
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="glass-card p-4 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping"></div>
          <h3 className="text-sm font-semibold font-mono text-slate-100">
            PRICE ACTION & VOLUME ({data?.symbol || 'BTC'})
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Interval: <span className="text-neon-cyan font-bold">{data?.interval || '1D'}</span>
        </span>
      </div>

      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading candlestick data...
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
        </div>
      )}
    </div>
  );
};
