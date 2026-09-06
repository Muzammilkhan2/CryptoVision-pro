import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { FearGreedData } from '@cryptovision/shared-types';

interface FearGreedGaugeChartProps {
  data?: FearGreedData;
  isLoading?: boolean;
}

export const FearGreedGaugeChart: React.FC<FearGreedGaugeChartProps> = ({ data, isLoading }) => {
  const option = useMemo(() => {
    const value = data?.value || 50;

    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: '95%',
          center: ['50%', '70%'],
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.25, '#FF3366'],
                [0.45, '#FFB800'],
                [0.55, '#94A3B8'],
                [0.75, '#00F0FF'],
                [1.0, '#00FF66'],
              ],
            },
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '22%',
            width: 10,
            offsetCenter: [0, '-55%'],
            itemStyle: { color: '#FFFFFF' },
          },
          axisTick: { length: 6, lineStyle: { color: 'rgba(255,255,255,0.2)', width: 1 } },
          splitLine: { length: 12, lineStyle: { color: 'rgba(255,255,255,0.4)', width: 2 } },
          axisLabel: { color: '#94A3B8', fontSize: 10, distance: -35 },
          title: { offsetCenter: [0, '-20%'], fontSize: 14, color: '#E2E8F0', fontWeight: 'bold' },
          detail: {
            fontSize: 28,
            offsetCenter: [0, '25%'],
            valueAnimation: true,
            formatter: '{value}',
            color: '#00F0FF',
            fontFamily: 'JetBrains Mono',
          },
          data: [{ value, name: data?.label || 'Neutral' }],
        },
      ],
    };
  }, [data]);

  return (
    <div className="glass-card p-4 flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold font-mono text-slate-100">
          FEAR & GREED SENTIMENT
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/30">
          UPDATED REAL-TIME
        </span>
      </div>

      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
          Computing sentiment index...
        </div>
      ) : (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center">
          <ReactECharts option={option} style={{ height: '220px', width: '100%' }} notMerge={true} />
        </div>
      )}
    </div>
  );
};
