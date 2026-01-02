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
      <div
        className={cn(
          'flex',
          // Adjust gap based on number of hands
          hands.length >= 4 ? 'gap-4' : 'gap-8'
        )}
      >
        {hands.map((hand, handIndex) => {
          const isCurrentHand = handIndex === currentHandIndex;

          return (
            <div
              key={handIndex}
              className={cn(
                'flex flex-col items-center space-y-3 rounded-lg transition-all',
                // Adjust padding for more hands
                hands.length >= 4 ? 'p-3' : 'p-4',
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

              {/* Cards with adjusted gap */}
              <div
                className={cn(
                  'flex',
                  hands.length >= 4 ? 'gap-1' : 'gap-2'
                )}
              >
                {hand.cards.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>

              {/* Hand value */}
              <div
                className={cn(
                  'font-medium min-h-[28px]',
                  hands.length >= 4 ? 'text-base' : 'text-lg',
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
