import React from 'react';
import { TickerItem } from '@cryptovision/shared-types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerBannerProps {
  tickers: TickerItem[];
  isLoading?: boolean;
}

export const TickerBanner: React.FC<TickerBannerProps> = ({ tickers, isLoading }) => {
  if (isLoading || !tickers.length) {
    return (
      <div className="h-10 bg-bg-secondary/60 border-b border-border-glass flex items-center px-4 overflow-hidden">
        <div className="animate-pulse flex space-x-8 text-xs text-slate-400">
          <span>Loading live market feeds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-10 bg-bg-secondary/80 border-b border-border-glass overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap space-x-8 px-4 items-center">
        {tickers.concat(tickers).map((ticker, idx) => {
          const isPositive = ticker.change24h >= 0;
          return (
            <div
              key={`${ticker.symbol}-${idx}`}
              className="inline-flex items-center space-x-2 text-xs font-mono py-1 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="font-semibold text-slate-200">{ticker.symbol}</span>
              <span className="text-slate-300">{formatCurrency(ticker.price)}</span>
              <span
                className={`inline-flex items-center space-x-0.5 ${
                  isPositive ? 'text-neon-green' : 'text-neon-red'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{formatPercentage(ticker.change24h)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
