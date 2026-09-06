import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { PortfolioPosition, ApiResponse } from '@cryptovision/shared-types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { Briefcase, Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';

interface PortfolioResponse {
  totalValueUsd: number;
  totalCostUsd: number;
  totalUnrealizedPnl: number;
  totalReturnPercentage: number;
  positions: PortfolioPosition[];
}

export const PortfolioManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('BTC');
  const [quantity, setQuantity] = useState('0.5');
  const [costBasis, setCostBasis] = useState('62000');

  const { data: portfolio, isLoading } = useQuery<PortfolioResponse>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<PortfolioResponse>>('/api/v1/portfolio');
      return res.data.data as PortfolioResponse;
    },
  });

  const addPositionMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/v1/portfolio/positions', {
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        costBasis: parseFloat(costBasis),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setShowModal(false);
    },
  });

  const removePositionMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/v1/portfolio/positions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const isProfit = (portfolio?.totalUnrealizedPnl || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 border border-neon-cyan/20 shadow-glowCyan">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono mb-2">
            <Wallet className="w-4 h-4 text-neon-cyan" />
            <span>PORTFOLIO VALUATION</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(portfolio?.totalValueUsd || 0)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Cost Basis: {formatCurrency(portfolio?.totalCostUsd || 0)}
          </div>
        </div>

        <div className="glass-card p-5 border border-border-glass">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono mb-2">
            <PieChart className="w-4 h-4 text-neon-purple" />
            <span>UNREALIZED PROFIT / LOSS</span>
          </div>
          <div className={`text-2xl font-bold font-mono flex items-center space-x-1 ${
            isProfit ? 'text-neon-green glow-text-green' : 'text-neon-red glow-text-red'
          }`}>
            {isProfit ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
            <span>{formatCurrency(portfolio?.totalUnrealizedPnl || 0)}</span>
          </div>
          <div className={`text-[11px] font-mono mt-1 ${isProfit ? 'text-neon-green' : 'text-neon-red'}`}>
            Return: {formatPercentage(portfolio?.totalReturnPercentage || 0)}
          </div>
        </div>

        <div className="glass-card p-5 border border-border-glass">
          <div className="text-slate-400 text-xs font-mono mb-2">TOTAL HOLDINGS</div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {portfolio?.positions?.length || 0} Assets
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Multi-Chain Custody</div>
        </div>

        <div className="glass-card p-5 flex flex-col justify-between border border-border-glass">
          <div className="text-slate-400 text-xs font-mono">PORTFOLIO ACTIONS</div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-xs font-mono font-bold shadow-glowCyan hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>ADD POSITION</span>
          </button>
        </div>
      </div>

      {/* Positions Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border-glass flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-neon-cyan" />
            <h3 className="text-sm font-semibold font-mono text-slate-100">
              TRACKED POSITIONS & COST BASIS
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-bg-secondary/80 text-slate-400 border-b border-border-glass">
              <tr>
                <th className="p-4">ASSET</th>
                <th className="p-4">HOLDINGS</th>
                <th className="p-4">AVG COST BASIS</th>
                <th className="p-4">CURRENT PRICE</th>
                <th className="p-4">MARKET VALUE</th>
                <th className="p-4">UNREALIZED P&L</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading portfolio positions...</td>
                </tr>
              ) : !portfolio?.positions?.length ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No positions recorded yet. Click Add Position above!</td>
                </tr>
              ) : (
                portfolio.positions.map((pos) => {
                  const mktValue = pos.quantity * (pos.currentPrice || 0);
                  const pnl = pos.unrealizedPnl || 0;
                  const isPosProfit = pnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center font-bold text-neon-purple">
                          {pos.symbol.substring(0, 3)}
                        </div>
                        <span className="font-bold text-slate-100">{pos.symbol}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-200">
                        {pos.quantity} {pos.symbol}
                      </td>
                      <td className="p-4 text-slate-300">{formatCurrency(pos.costBasis)}</td>
                      <td className="p-4 font-bold text-slate-100">{formatCurrency(pos.currentPrice || 0)}</td>
                      <td className="p-4 font-bold text-slate-100">{formatCurrency(mktValue)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 font-bold ${
                          isPosProfit ? 'text-neon-green' : 'text-neon-red'
                        }`}>
                          {isPosProfit ? '+' : ''}{formatCurrency(pnl)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => removePositionMutation.mutate(pos.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-neon-red transition-colors"
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

      {/* Modal for Adding a Position */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 relative border border-neon-cyan/40 shadow-glowCyan">
            <h3 className="text-sm font-bold font-mono text-slate-100 mb-4">
              RECORD ASSET PURCHASE
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ASSET SYMBOL</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                >
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="SOL">SOL - Solana</option>
                  <option value="BNB">BNB - Binance Coin</option>
                  <option value="AVAX">AVAX - Avalanche</option>
                  <option value="LINK">LINK - Chainlink</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">QUANTITY PURCHASED</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.5"
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PURCHASE PRICE / COST BASIS (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={costBasis}
                  onChange={(e) => setCostBasis(e.target.value)}
                  placeholder="62000"
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-border-glass">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border-glass text-slate-400 hover:text-slate-200"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => addPositionMutation.mutate()}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-white font-bold shadow-glowCyan"
                >
                  SAVE POSITION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
