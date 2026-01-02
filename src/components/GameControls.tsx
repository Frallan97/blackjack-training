import React from 'react';
import { Hand, GamePhase, GameResult } from '../types/game';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface GameControlsProps {
  phase: GamePhase;
  result: GameResult;
  currentHand: Hand;
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

  return (
    <div className={cn('flex flex-col items-center space-y-4 p-6', className)}>
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
