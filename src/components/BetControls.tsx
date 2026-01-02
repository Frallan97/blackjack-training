import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { getBettingRecommendation } from '../game/counting';

interface BetControlsProps {
  className?: string;
}

export const BetControls: React.FC<BetControlsProps> = ({ className }) => {
  const { bankroll, currentBet, trueCount, setBet, phase } = useGameStore();

  // Can adjust bet when not actively playing (betting phase, result phase, or initial state)
  const canAdjustBet = phase === 'betting' || phase === 'result';

  // Get betting recommendation based on true count
  const recommendation = getBettingRecommendation(trueCount);

  const adjustBet = (amount: number) => {
    const newBet = Math.max(10, Math.min(currentBet + amount, bankroll));
    setBet(newBet);
  };

  const setQuickBet = (amount: number) => {
    setBet(amount);
  };

  const setRecommendedBet = () => {
    // Base bet of 10, multiply by recommendation level
    const recommendedAmount = 10 * recommendation.betMultiplier;
    setBet(Math.min(recommendedAmount, bankroll));
  };

  return (
    <div className={cn('bg-black/30 rounded-lg p-4 space-y-4', className)}>
      {/* Bankroll Display */}
      <div className="flex items-center justify-between">
        <div className="text-white/70 text-sm font-medium">Bankroll:</div>
        <div
          className={cn(
            'text-2xl font-bold',
            bankroll > 10000 ? 'text-green-400' : bankroll < 5000 ? 'text-red-400' : 'text-white'
          )}
        >
          ${bankroll.toLocaleString()}
        </div>
      </div>

      {/* Current Bet Display */}
      <div className="flex items-center justify-between">
        <div className="text-white/70 text-sm font-medium">Current Bet:</div>
        <div className="text-xl font-bold text-yellow-400">${currentBet.toLocaleString()}</div>
      </div>

      {/* Bet Adjustment Controls */}
      {canAdjustBet && (
        <>
          {/* Plus/Minus Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => adjustBet(-10)}
              disabled={currentBet <= 10}
              size="sm"
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 flex-1"
            >
              -$10
            </Button>
            <Button
              onClick={() => adjustBet(-50)}
              disabled={currentBet <= 50}
              size="sm"
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 flex-1"
            >
              -$50
            </Button>
            <Button
              onClick={() => adjustBet(50)}
              disabled={currentBet + 50 > bankroll}
              size="sm"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 flex-1"
            >
              +$50
            </Button>
            <Button
              onClick={() => adjustBet(10)}
              disabled={currentBet + 10 > bankroll}
              size="sm"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 flex-1"
            >
              +$10
            </Button>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                onClick={() => setQuickBet(amount)}
                disabled={amount > bankroll}
                size="sm"
                className={cn(
                  'text-xs font-semibold',
                  currentBet === amount
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                )}
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Recommended Bet */}
          {recommendation.betMultiplier > 1 && (
            <div className="bg-blue-600/30 border border-blue-400/50 rounded-lg p-3">
              <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
                Recommended Bet
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white font-bold">
                  ${(10 * recommendation.betMultiplier).toLocaleString()} ({recommendation.level})
                </div>
                <Button
                  onClick={setRecommendedBet}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  Apply
                </Button>
              </div>
              <div className="text-blue-200 text-xs mt-1">
                True count: {trueCount > 0 ? '+' : ''}
                {trueCount.toFixed(1)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
