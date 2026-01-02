import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface StatsPanelProps {
  className?: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ className }) => {
  const { stats, resetStats, resetBankroll } = useGameStore();

  const winRate = stats.handsPlayed > 0
    ? ((stats.wins / stats.handsPlayed) * 100).toFixed(1)
    : '0.0';

  const blackjackRate = stats.handsPlayed > 0
    ? ((stats.blackjacks / stats.handsPlayed) * 100).toFixed(1)
    : '0.0';

  const handleResetAll = () => {
    if (confirm('Reset all statistics and bankroll to defaults?')) {
      resetStats();
      resetBankroll();
    }
  };

  return (
    <div className={cn('bg-black/40 rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">
          Session Statistics
        </div>
        <Button
          size="sm"
          onClick={handleResetAll}
          className="text-xs bg-red-600/80 hover:bg-red-700 text-white h-6 px-3 font-semibold"
        >
          Reset All
        </Button>
      </div>

      {/* Total Profit - Prominent Display */}
      <div className="bg-white/10 rounded-lg p-3 mb-2">
        <div className="text-white/70 text-xs font-medium mb-1">Total Profit/Loss</div>
        <div
          className={cn(
            'text-3xl font-bold',
            stats.totalProfit > 0
              ? 'text-green-400'
              : stats.totalProfit < 0
              ? 'text-red-400'
              : 'text-white'
          )}
        >
          {stats.totalProfit > 0 ? '+' : ''}${stats.totalProfit.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Hands Played */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Hands Played</div>
          <div className="text-2xl font-bold text-white">{stats.handsPlayed}</div>
        </div>

        {/* Win Rate */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Win Rate</div>
          <div className="text-2xl font-bold text-green-400">{winRate}%</div>
        </div>

        {/* Wins */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Wins</div>
          <div className="text-xl font-bold text-green-500">{stats.wins}</div>
        </div>

        {/* Losses */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Losses</div>
          <div className="text-xl font-bold text-red-500">{stats.losses}</div>
        </div>

        {/* Pushes */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Pushes</div>
          <div className="text-xl font-bold text-yellow-500">{stats.pushes}</div>
        </div>

        {/* Blackjacks */}
        <div className="bg-white/5 rounded p-2">
          <div className="text-white/50 text-xs">Blackjacks</div>
          <div className="text-xl font-bold text-yellow-400">
            {stats.blackjacks} ({blackjackRate}%)
          </div>
        </div>
      </div>
    </div>
  );
};
