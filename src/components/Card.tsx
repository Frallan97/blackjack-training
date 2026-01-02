import React from 'react';
import { Card as CardType, Suit } from '../types/game';
import { cn } from '../lib/utils';

interface CardProps {
  card: CardType | null;
  faceDown?: boolean;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export const Card: React.FC<CardProps> = React.memo(
  ({ card, faceDown = false, className }) => {
    if (!card && !faceDown) {
      return null;
    }

    // Card back design
    if (faceDown || !card) {
      return (
        <div
          className={cn(
            'relative w-24 h-36 rounded-lg border-2 border-gray-300',
            'bg-gradient-to-br from-blue-600 to-blue-800',
            'flex items-center justify-center',
            'shadow-lg',
            'transition-transform hover:scale-105',
            className
          )}
        >
          <div className="text-3xl text-blue-200 opacity-50">♠</div>
        </div>
      );
    }

    const suitSymbol = suitSymbols[card.suit];
    const suitColor = suitColors[card.suit];

    return (
      <div
        className={cn(
          'relative w-20 h-28 rounded-lg border-2 border-gray-300',
          'bg-white',
          'shadow-lg',
          'transition-transform hover:scale-105',
          'flex flex-col items-center justify-center gap-1 p-2',
          className
        )}
      >
        {/* Rank */}
        <span className={cn('text-2xl font-bold', suitColor)}>{card.rank}</span>

        {/* Suit symbol */}
        <span className={cn('text-3xl', suitColor)}>{suitSymbol}</span>
      </div>
    );
  }
);

Card.displayName = 'Card';
