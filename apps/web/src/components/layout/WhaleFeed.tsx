import React from 'react';
import { WhaleTx } from '@cryptovision/shared-types';
import { formatCurrency, formatLargeNumber, shortenAddress, formatTimeAgo } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Radio } from 'lucide-react';

interface WhaleFeedProps {
  transactions: WhaleTx[];
  isLoading?: boolean;
}

export const WhaleFeed: React.FC<WhaleFeedProps> = ({ transactions, isLoading }) => {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-glass flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-neon-pink animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">
            WHALE TRANSACTIONS
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-pink/10 text-neon-pink border border-neon-pink/30">
          LIVE FEED
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading && !transactions.length ? (
          <div className="p-8 text-center text-xs text-slate-400">Listening to on-chain whale activity...</div>
        ) : (
          transactions.map((tx) => {
            const isBuy = tx.type === 'buy';
            const isSell = tx.type === 'sell';

            return (
              <div
                key={tx.id}
                className={`p-3 rounded-xl border transition-all ${
                  tx.isLarge
                    ? 'bg-gradient-to-r from-neon-pink/10 to-transparent border-neon-pink/40 shadow-glowRed'
                    : 'bg-bg-secondary/60 border-border-glass hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                        isBuy
                          ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                          : isSell
                          ? 'bg-neon-red/15 text-neon-red border border-neon-red/30'
                          : 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                      }`}
                    >
                      {isBuy ? <ArrowUpRight size={10} /> : isSell ? <ArrowDownRight size={10} /> : <RefreshCw size={10} />}
                      <span>{tx.type}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {formatLargeNumber(tx.amount)} {tx.currency}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-100">
                    {formatCurrency(tx.usdValue, 'USD', true)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="hover:text-neon-cyan cursor-pointer transition-colors">
                    {shortAddress(tx.address)}
                  </span>
                  <span>{formatTimeAgo(tx.occurredAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function shortAddress(addr: string) {
  return shortenAddress(addr, 4);
}
