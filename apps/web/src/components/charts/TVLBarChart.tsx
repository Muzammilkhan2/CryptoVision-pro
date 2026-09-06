import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TvlProtocol } from '@cryptovision/shared-types';
import { formatCurrency } from '../../utils/formatters';

interface TVLBarChartProps {
  data?: TvlProtocol[];
  isLoading?: boolean;
}

export const TVLBarChart: React.FC<TVLBarChartProps> = ({ data, isLoading }) => {
  const option = useMemo(() => {
    if (!data || !data.length) return {};

    const sorted = [...data].sort((a, b) => a.tvl - b.tvl);
    const names = sorted.map((p) => p.name);
    const values = sorted.map((p) => p.tvl);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(17, 20, 37, 0.95)',
        borderColor: 'rgba(157, 0, 255, 0.4)',
        textStyle: { color: '#F1F5F9', fontFamily: 'JetBrains Mono' },
        formatter: (params: any) => {
          const item = params[0];
          return `${item.name}<br/>TVL: <b>${formatCurrency(item.value, 'USD', true)}</b>`;
        },
      },
      grid: { left: '3%', right: '8%', top: '5%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          formatter: (v: number) => formatCurrency(v, 'USD', true),
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        axisLabel: { color: '#E2E8F0', fontSize: 11, fontFamily: 'Inter' },
      },
      series: [
        {
          name: 'Total Value Locked',
          type: 'bar',
          data: values,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#0066FF' },
                { offset: 1, color: '#9D00FF' },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="glass-card p-4 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold font-mono text-slate-100">
          DEFI PROTOCOL TVL RANKINGS
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
          DEFILLAMA AGGREGATED
        </span>
      </div>

      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading DeFi TVL data...
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
        </div>
      )}
    </div>
  );
};
