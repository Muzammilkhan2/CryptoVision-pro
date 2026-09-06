import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { PriceAlert, AlertCondition, ApiResponse } from '@cryptovision/shared-types';
import { formatCurrency } from '../../utils/formatters';
import { Bell, Plus, Trash2, Radio } from 'lucide-react';

export const AlertsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('BTC');
  const [condition, setCondition] = useState<AlertCondition>('price_above');
  const [threshold, setThreshold] = useState('70000');
  const [channel, setChannel] = useState<'email' | 'push' | 'webhook'>('email');

  const { data: alerts, isLoading } = useQuery<PriceAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<PriceAlert[]>>('/api/v1/alerts');
      return res.data.data || [];
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/v1/alerts', {
        symbol: symbol.toUpperCase(),
        condition,
        threshold: parseFloat(threshold),
        channel,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowModal(false);
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`/api/v1/alerts/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/v1/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-neon-pink" />
            <h2 className="text-lg font-bold font-mono text-slate-100">
              PRICE & VOLATILITY ALERTS
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time threshold triggers evaluated against live on-chain and spot feeds
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white text-xs font-mono font-bold shadow-glowPurple hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>NEW ALERT TRIGGER</span>
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full glass-card p-8 text-center text-xs font-mono text-slate-400">
            Loading active alerts...
          </div>
        ) : !alerts?.length ? (
          <div className="col-span-full glass-card p-8 text-center text-xs font-mono text-slate-400">
            No price alerts configured. Create one above to receive instant notifications!
          </div>
        ) : (
          alerts.map((alert) => {
            const isAbove = alert.condition === 'price_above';
            return (
              <div
                key={alert.id}
                className={`glass-card p-5 border flex flex-col justify-between transition-all ${
                  alert.active ? 'border-neon-cyan/30' : 'border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center font-bold text-xs text-neon-cyan font-mono">
                        {alert.symbol}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-100 font-mono">
                          {alert.symbol} Trigger
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Channel: <span className="uppercase text-slate-300">{alert.channel}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAlertMutation.mutate(alert.id)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                        alert.active
                          ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {alert.active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-bg-secondary/70 border border-border-glass mb-4">
                    <div className="text-[11px] font-mono text-slate-400 mb-1">Trigger Condition:</div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      {isAbove ? 'Price Rises Above' : 'Price Drops Below'}{' '}
                      <span className="text-neon-cyan">{formatCurrency(alert.threshold)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-glass text-[11px] font-mono text-slate-400">
                  <span>Created {alert.createdAt.split('T')[0]}</span>
                  <button
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    className="p-1 text-slate-400 hover:text-neon-red transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Creating an Alert */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 relative border border-neon-pink/40 shadow-glowPurple">
            <h3 className="text-sm font-bold font-mono text-slate-100 mb-4 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-neon-pink animate-pulse" />
              <span>CONFIGURE PRICE TRIGGER</span>
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">TARGET ASSET</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                >
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="SOL">SOL - Solana</option>
                  <option value="AVAX">AVAX - Avalanche</option>
                  <option value="LINK">LINK - Chainlink</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">CONDITION</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                >
                  <option value="price_above">Price Rises Above (&gt;=)</option>
                  <option value="price_below">Price Drops Below (&lt;=)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PRICE THRESHOLD (USD)</label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="70000"
                  className="w-full bg-bg-secondary border border-border-glass rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">NOTIFICATION CHANNEL</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['email', 'push', 'webhook'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`p-2 rounded-lg border text-center uppercase font-bold transition-all ${
                        channel === ch
                          ? 'border-neon-pink bg-neon-pink/15 text-slate-100'
                          : 'border-border-glass bg-bg-secondary text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
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
                  onClick={() => createAlertMutation.mutate()}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold shadow-glowPurple"
                >
                  ARM ALERT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
