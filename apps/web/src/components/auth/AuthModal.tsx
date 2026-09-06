import React, { useState } from 'react';
import axios from 'axios';
import { useAppStore } from '../../store/useAppStore';
import { X, Lock, Mail } from 'lucide-react';
import { ApiResponse, AuthResponse } from '@cryptovision/shared-types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, setUser, setToken } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'PREMIUM'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLogin ? { email, password } : { email, password, role };
      const res = await axios.post<ApiResponse<AuthResponse>>(endpoint, payload);

      if (res.data.success && res.data.data) {
        setUser(res.data.data.user);
        setToken(res.data.data.tokens.accessToken);
        setAuthModalOpen(false);
      } else {
        setError(res.data.error?.message || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-md p-6 relative border border-neon-cyan/30 shadow-glowCyan">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-glass mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-3 text-sm font-mono font-semibold transition-all ${
              isLogin ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-3 text-sm font-mono font-semibold transition-all ${
              !isLogin ? 'text-neon-purple border-b-2 border-neon-purple' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">EMAIL ADDRESS</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@cryptovision.pro"
                className="w-full bg-bg-secondary/90 border border-border-glass rounded-lg pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">PASSWORD</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg-secondary/90 border border-border-glass rounded-lg pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">SUBSCRIPTION TIER</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    role === 'USER'
                      ? 'border-neon-cyan bg-neon-cyan/10 text-slate-100'
                      : 'border-border-glass bg-bg-secondary/60 text-slate-400'
                  }`}
                >
                  <div className="font-bold mb-0.5">STANDARD</div>
                  <div className="text-[10px] text-slate-400">Basic alerts & feed</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PREMIUM')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    role === 'PREMIUM'
                      ? 'border-neon-purple bg-neon-purple/10 text-slate-100'
                      : 'border-border-glass bg-bg-secondary/60 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-neon-purple mb-0.5">PREMIUM PRO</div>
                  <div className="text-[10px] text-slate-400">Unlimited on-chain alerts</div>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple font-bold text-white shadow-glowCyan hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN TO DASHBOARD' : 'ACTIVATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};
