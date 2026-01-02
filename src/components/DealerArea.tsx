import React from 'react';
import { Hand } from '../types/game';
import { Card } from './Card';
import { getHandDescription } from '../game/hand';
import { cn } from '../lib/utils';

interface DealerAreaProps {
  hand: Hand;
  showHoleCard: boolean;
  className?: string;
}

export const DealerArea: React.FC<DealerAreaProps> = ({
  hand,
  showHoleCard,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-green-700 to-green-800 rounded-lg',
        className
      )}
    >
      <div className="text-white text-xl font-semibold">Dealer</div>

      {/* Cards */}
      <div className="flex gap-2">
        {hand.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            faceDown={!showHoleCard && index === 1}
          />
        ))}
      </div>

      {/* Hand value */}
      <div className="text-white text-lg font-medium min-h-[28px]">
        {showHoleCard && hand.cards.length > 0
          ? getHandDescription(hand)
          : hand.cards.length > 0
          ? `Showing: ${hand.cards[0].rank}`
          : ''}
      </div>
    </div>
  );
};
