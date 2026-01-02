import React from 'react';
import { Hand, GamePhase, GameResult, StrategyDecision } from '../types/game';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface GameControlsProps {
  phase: GamePhase;
  result: GameResult;
  currentHand: Hand;
  strategyHint: StrategyDecision | null;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onNewRound: () => void;
  onInitializeGame: () => void;
  className?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  phase,
  result,
  currentHand,
  strategyHint,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onNewRound,
  onInitializeGame,
  className,
}) => {
  const isPlayerTurn = phase === 'player-turn';
  const isGameOver = phase === 'result';
  const isInitialBetting = phase === 'betting';

  // Disable actions if not player's turn or hand is busted/blackjack
  const actionsDisabled =
    !isPlayerTurn || currentHand.isBusted || currentHand.isBlackjack;

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'hit': return 'HIT';
      case 'stand': return 'STAND';
      case 'double': return 'DOUBLE';
      case 'split': return 'SPLIT';
      case 'surrender': return 'SURRENDER';
      default: return action.toUpperCase();
    }
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4 p-6', className)}>
      {/* Strategy Hint */}
      {strategyHint && isPlayerTurn && !actionsDisabled && (
        <div className="bg-blue-600/30 border border-blue-400/50 rounded-lg px-4 py-2 text-center">
          <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
            Recommended Play
          </div>
          <div className="text-white text-lg font-bold">
            {getActionLabel(strategyHint.action)}
          </div>
          {strategyHint.explanation && (
            <div className="text-blue-200 text-xs mt-1">
              {strategyHint.explanation}
            </div>
          )}
        </div>
      )}

      {/* Game result message */}
      {isGameOver && (
        <div className="text-center space-y-2">
          <div
            className={cn(
              'text-2xl font-bold',
              result === 'win' || result === 'blackjack'
                ? 'text-green-400'
                : result === 'loss'
                ? 'text-red-400'
                : 'text-yellow-400'
            )}
          >
            {result === 'win' && 'You Win!'}
            {result === 'loss' && 'Dealer Wins'}
            {result === 'push' && 'Push'}
            {result === 'blackjack' && 'Blackjack!'}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {isInitialBetting && (
          <Button
            onClick={onInitializeGame}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Initialize Game
          </Button>
        )}

        {!isInitialBetting && !isGameOver && (
          <>
            <Button
              onClick={onHit}
              disabled={actionsDisabled}
              size="lg"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Hit
            </Button>

            <Button
              onClick={onStand}
              disabled={actionsDisabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Stand
            </Button>

            <Button
              onClick={onDouble}
              disabled={actionsDisabled || !currentHand.canDouble}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              Double
            </Button>

            <Button
              onClick={onSplit}
              disabled={actionsDisabled || !currentHand.canSplit}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              Split
            </Button>
          </>
        )}

        {isGameOver && (
          <Button
            onClick={onNewRound}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Round
          </Button>
        )}
      </div>

      {/* Helper text */}
      {isPlayerTurn && !actionsDisabled && (
        <div className="text-white/70 text-sm text-center">
          {currentHand.canSplit && <div>You can split this pair</div>}
          {currentHand.canDouble && !currentHand.canSplit && (
            <div>You can double down</div>
          )}
        </div>
      )}
    </div>
  );
};
