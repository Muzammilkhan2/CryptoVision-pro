import React from 'react';
import { useAppStore, DashboardTab } from '../../store/useAppStore';
import { Timeframe } from '@cryptovision/shared-types';
import { Activity, Bell, SlidersHorizontal, User, LogOut, Star, LineChart, Briefcase } from 'lucide-react';

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M'];
const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'LINK'];

export const Header: React.FC = () => {
  const {
    currentSymbol,
    currentTimeframe,
    isWhaleFeedOpen,
    activeTab,
    user,
    setCurrentSymbol,
    setCurrentTimeframe,
    toggleWhaleFeed,
    setActiveTab,
    setAuthModalOpen,
    logout,
  } = useAppStore();

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'MARKET OVERVIEW', icon: <LineChart size={14} /> },
    { id: 'watchlist', label: 'WATCHLIST', icon: <Star size={14} /> },
    { id: 'alerts', label: 'PRICE ALERTS', icon: <Bell size={14} /> },
    { id: 'portfolio', label: 'PORTFOLIO', icon: <Briefcase size={14} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-xl border-b border-border-glass px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/40 flex items-center justify-center shadow-glowCyan">
            <Activity className="w-5 h-5 text-neon-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple font-mono">
                CRYPTOVISION
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block animate-ping"></span>
              <span>LIVE V2.0 ENGINE</span>
            </p>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-bg-secondary/70 p-1 rounded-xl border border-border-glass">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-glowCyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Context Selectors (Symbols & Timeframes) */}
      {activeTab === 'overview' && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Symbol Selector */}
          <div className="flex bg-bg-secondary/80 p-1 rounded-lg border border-border-glass">
            {SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => setCurrentSymbol(sym)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  currentSymbol === sym
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-glowCyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-bg-secondary/80 p-1 rounded-lg border border-border-glass">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setCurrentTimeframe(tf)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  currentTimeframe === tf
                    ? 'bg-neon-purple/25 text-purple-300 border border-neon-purple/40 shadow-glowPurple'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls & Auth State */}
      <div className="flex items-center space-x-2.5">
        {activeTab === 'overview' && (
          <button
            onClick={toggleWhaleFeed}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isWhaleFeedOpen
                ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30'
                : 'bg-bg-secondary text-slate-400 border-border-glass hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Whale Stream</span>
          </button>
        )}

        {/* User Auth Profile Trigger */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-border-glass">
            <div className="flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[120px]">
                {user.email.split('@')[0]}
              </span>
              <span className="text-[9px] font-mono text-neon-cyan font-bold tracking-wider uppercase">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg bg-bg-secondary border border-border-glass text-slate-400 hover:text-neon-red hover:border-neon-red/40 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-bold shadow-glowCyan hover:bg-neon-cyan/30 transition-all"
          >
            <User size={14} />
            <span>SIGN IN</span>
          </button>
        )}
      </div>
    </header>
  );
};
