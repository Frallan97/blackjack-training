import React from 'react';
import { useGameStore } from '../store/gameStore';
import { getCountLevel } from '../game/counting';
import { cn } from '../lib/utils';

export const CountDisplay: React.FC = () => {
  const { runningCount, trueCount, remainingDecks, settings } = useGameStore();

  if (!settings.showCount) {
    return null;
  }

  const countLevel = getCountLevel(trueCount);

  const levelColors = {
    'very-negative': 'bg-red-600',
    'negative': 'bg-red-500',
    'neutral': 'bg-gray-600',
    'positive': 'bg-green-500',
    'very-positive': 'bg-green-600',
  };

  const levelLabels = {
    'very-negative': 'Very Unfavorable',
    'negative': 'Unfavorable',
    'neutral': 'Neutral',
    'positive': 'Favorable',
    'very-positive': 'Very Favorable',
  };

  return (
    <div className="bg-black/40 rounded-lg p-4 space-y-3">
      <div className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">
        Card Count ({settings.countingSystem})
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Running Count */}
        <div>
          <div className="text-white/50 text-xs mb-1">Running Count</div>
          <div className="text-3xl font-bold text-white">
            {runningCount > 0 ? '+' : ''}{runningCount}
          </div>
        </div>

        {/* True Count */}
        <div>
          <div className="text-white/50 text-xs mb-1">True Count</div>
          <div className="text-3xl font-bold text-white">
            {trueCount > 0 ? '+' : ''}{trueCount}
          </div>
        </div>
      </div>

      {/* Count Level Indicator */}
      <div className="mt-3">
        <div className={cn(
          'rounded px-3 py-2 text-center text-sm font-semibold text-white',
          levelColors[countLevel]
        )}>
          {levelLabels[countLevel]}
        </div>
      </div>

      {/* Remaining Decks */}
      <div className="text-white/50 text-xs text-center pt-2 border-t border-white/10">
        {remainingDecks.toFixed(1)} decks remaining
      </div>
    </div>
  );
};
