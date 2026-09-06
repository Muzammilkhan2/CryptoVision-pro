import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { OnChainMetricsPayload } from '@cryptovision/shared-types';
import { formatCurrency, formatLargeNumber } from '../../utils/formatters';

interface OnChainMetricsChartProps {
  data?: OnChainMetricsPayload;
  isLoading?: boolean;
}

export const OnChainMetricsChart: React.FC<OnChainMetricsChartProps> = ({ data, isLoading }) => {
  const option = useMemo(() => {
    if (!data || !data.metrics || !data.metrics.length) return {};

    const dates = data.metrics.map((m) => m.timestamp.slice(5));
    const volume = data.metrics.map((m) => m.txVolumeUsd);
    const addresses = data.metrics.map((m) => m.activeAddresses);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(17, 20, 37, 0.95)',
        borderColor: 'rgba(0, 240, 255, 0.3)',
        textStyle: { color: '#F1F5F9', fontFamily: 'JetBrains Mono' },
      },
      legend: {
        data: ['Tx Volume (USD)', 'Active Addresses'],
        textStyle: { color: '#94A3B8', fontSize: 11, fontFamily: 'Inter' },
        top: '0%',
      },
      grid: { left: '3%', right: '3%', top: '15%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        axisLabel: { color: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Volume',
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
          axisLabel: {
            color: '#94A3B8',
            fontSize: 10,
            formatter: (v: number) => formatCurrency(v, 'USD', true),
          },
        },
        {
          type: 'value',
          name: 'Addresses',
          splitLine: { show: false },
          axisLabel: {
            color: '#94A3B8',
            fontSize: 10,
            formatter: (v: number) => formatLargeNumber(v),
          },
        },
      ],
      series: [
        {
          name: 'Tx Volume (USD)',
          type: 'bar',
          data: volume,
          itemStyle: { color: 'rgba(0, 240, 255, 0.45)', borderRadius: [3, 3, 0, 0] },
        },
        {
          name: 'Active Addresses',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: addresses,
          itemStyle: { color: '#FF007A' },
          lineStyle: { width: 2, shadowColor: 'rgba(255, 0, 122, 0.5)', shadowBlur: 8 },
        },
      ],
    };
  }, [data]);

  return (
    <div className="glass-card p-4 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold font-mono text-slate-100">
          ON-CHAIN VOLUME & ACTIVITY
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
          ETHEREUM MAINNET
        </span>
      </div>

      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading on-chain metrics...
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
        </div>
      )}
    </div>
  );
};
