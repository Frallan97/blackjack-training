import React from 'react';
import { Hand } from '../types/game';
import { Card } from './Card';
import { getHandDescription } from '../game/hand';
import { cn } from '../lib/utils';

interface PlayerAreaProps {
  hands: Hand[];
  currentHandIndex: number;
  className?: string;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({
  hands,
  currentHandIndex,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center space-y-4 p-6', className)}>
      <div className="text-white text-xl font-semibold">Player</div>

      {/* Multiple hands (for split scenarios) */}
      <div className="flex gap-8">
        {hands.map((hand, handIndex) => {
          const isCurrentHand = handIndex === currentHandIndex;

          return (
            <div
              key={handIndex}
              className={cn(
                'flex flex-col items-center space-y-3 p-4 rounded-lg transition-all',
                isCurrentHand
                  ? 'bg-white/10 ring-2 ring-yellow-400'
                  : 'bg-white/5'
              )}
            >
              {/* Hand indicator for splits */}
              {hands.length > 1 && (
                <div className="text-white text-sm font-medium">
                  Hand {handIndex + 1}
                  {isCurrentHand && ' (Active)'}
                </div>
              )}

              {/* Cards */}
              <div className="flex gap-2">
                {hand.cards.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>

              {/* Hand value */}
              <div
                className={cn(
                  'text-lg font-medium min-h-[28px]',
                  hand.isBusted
                    ? 'text-red-400'
                    : hand.isBlackjack
                    ? 'text-yellow-400'
                    : 'text-white'
                )}
              >
                {hand.cards.length > 0 ? getHandDescription(hand) : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
