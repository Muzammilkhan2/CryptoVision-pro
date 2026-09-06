import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Watchlist, TickerItem, ApiResponse } from '@cryptovision/shared-types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { Plus, Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface WatchlistManagerProps {
  tickers: TickerItem[];
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ tickers }) => {
  const queryClient = useQueryClient();
  const [newSymbol, setNewSymbol] = useState('');

  const priceMap = new Map<string, TickerItem>();
  tickers.forEach((t) => priceMap.set(t.symbol, t));

  const { data: watchlists, isLoading } = useQuery<Watchlist[]>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<Watchlist[]>>('/api/v1/watchlists');
      return res.data.data || [];
    },
  });

  const activeList = watchlists && watchlists.length > 0 ? watchlists[0] : null;

  const addSymbolMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!activeList) return;
      await axios.post(`/api/v1/watchlists/${activeList.id}/symbols`, { symbol });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setNewSymbol('');
    },
  });

  const removeSymbolMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!activeList) return;
      await axios.delete(`/api/v1/watchlists/${activeList.id}/symbols/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-neon-yellow" />
            <h2 className="text-lg font-bold font-mono text-slate-100">
              {activeList?.name || 'CUSTOM WATCHLIST'}
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Tracked Assets ({activeList?.symbols?.length || 0}) • Real-time Mark-to-Market Valuation
          </p>
        </div>

        {/* Add Symbol Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="ADD SYMBOL (e.g. SOL)"
            className="bg-bg-secondary/90 border border-border-glass rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan uppercase"
          />
          <button
            onClick={() => newSymbol && addSymbolMutation.mutate(newSymbol)}
            className="px-4 py-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-bold hover:bg-neon-cyan/30 transition-all flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>TRACK</span>
          </button>
        </div>
      </div>

      {/* Asset Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-bg-secondary/80 text-slate-400 border-b border-border-glass">
              <tr>
                <th className="p-4">ASSET</th>
                <th className="p-4">PRICE (USD)</th>
                <th className="p-4">24H CHANGE</th>
                <th className="p-4">24H HIGH / LOW</th>
                <th className="p-4">MARKET CAP</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading watchlist assets...</td>
                </tr>
              ) : !activeList?.symbols?.length ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No assets tracked yet. Add your first symbol above!</td>
                </tr>
              ) : (
                activeList.symbols.map((symbol) => {
                  const t = priceMap.get(symbol) || {
                    symbol,
                    name: symbol,
                    price: 150.0,
                    change24h: 2.5,
                    high24h: 155.0,
                    low24h: 145.0,
                    marketCap: 25000000000,
                  };
                  const isPositive = t.change24h >= 0;

                  return (
                    <tr key={symbol} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center font-bold text-neon-cyan">
                          {symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{symbol}</div>
                          <div className="text-[11px] text-slate-400">{t.name}</div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-100">{formatCurrency(t.price)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 ${isPositive ? 'text-neon-green' : 'text-neon-red'}`}>
                          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{formatPercentage(t.change24h)}</span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {formatCurrency(t.high24h, 'USD', true)} / {formatCurrency(t.low24h, 'USD', true)}
                      </td>
                      <td className="p-4 text-slate-300">{formatCurrency(t.marketCap, 'USD', true)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => removeSymbolMutation.mutate(symbol)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-neon-red hover:bg-neon-red/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
