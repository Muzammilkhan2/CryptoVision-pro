import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TickerItem } from '@cryptovision/shared-types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface MarketCapTreemapChartProps {
  data?: TickerItem[];
  isLoading?: boolean;
}

export const MarketCapTreemapChart: React.FC<MarketCapTreemapChartProps> = ({ data, isLoading }) => {
  const option = useMemo(() => {
    if (!data || !data.length) return {};

    const treeData = data.map((t) => ({
      name: t.symbol,
      value: t.marketCap,
      change: t.change24h,
      price: t.price,
      itemStyle: {
        color:
          t.change24h > 3
            ? '#00FF66'
            : t.change24h > 0
            ? 'rgba(0, 255, 102, 0.7)'
            : t.change24h > -3
            ? 'rgba(255, 51, 102, 0.7)'
            : '#FF3366',
      },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          const d = params.data;
          return `${d.name}<br/>Price: <b>${formatCurrency(d.price)}</b><br/>24h: <b>${formatPercentage(d.change)}</b><br/>Cap: <b>${formatCurrency(d.value, 'USD', true)}</b>`;
        },
      },
      series: [
        {
          type: 'treemap',
          data: treeData,
          leafDepth: 1,
          roam: false,
          label: {
            show: true,
            formatter: (params: any) => {
              const d = params.data;
              return `${d.name}\n${formatPercentage(d.change)}`;
            },
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'JetBrains Mono',
          },
          breadcrumb: { show: false },
        },
      ],
    };
  }, [data]);

  return (
    <div className="glass-card p-4 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold font-mono text-slate-100">
          MARKET DOMINANCE & HEATMAP
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30">
          24H PERFORMANCE
        </span>
      </div>

      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading market map...
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
        </div>
      )}
    </div>
  );
};
