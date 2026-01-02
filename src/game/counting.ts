import { Rank, CountingSystem, CountingSystemName, Card } from '../types/game';

/**
 * Hi-Lo Counting System
 * Most popular and easiest to learn
 * Balanced system (count returns to 0 after full deck)
 */
export const HiLoSystem: CountingSystem = {
  name: 'Hi-Lo',
  isBalanced: true,
  description: 'Most popular card counting system. +1 for low cards (2-6), 0 for neutral (7-9), -1 for high cards (10-A)',
  getCardValue(rank: Rank): number {
    // Low cards (2-6): +1
    if (['2', '3', '4', '5', '6'].includes(rank)) {
      return 1;
    }
    // Neutral cards (7-9): 0
    if (['7', '8', '9'].includes(rank)) {
      return 0;
    }
    // High cards (10, J, Q, K, A): -1
    if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) {
      return -1;
    }
    return 0;
  },
};

/**
 * KO (Knock-Out) Counting System
 * Unbalanced system that's easier to use (no true count conversion)
 */
export const KOSystem: CountingSystem = {
  name: 'KO',
  isBalanced: false,
  description: 'Unbalanced system. Similar to Hi-Lo but 7s are +1. No need to convert to true count.',
  getCardValue(rank: Rank): number {
    // Low cards (2-7): +1
    if (['2', '3', '4', '5', '6', '7'].includes(rank)) {
      return 1;
    }
    // Neutral cards (8-9): 0
    if (['8', '9'].includes(rank)) {
      return 0;
    }
    // High cards (10, J, Q, K, A): -1
    if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) {
      return -1;
    }
    return 0;
  },
};

/**
 * Omega II Counting System
 * More accurate but more complex multi-level system
 */
export const OmegaIISystem: CountingSystem = {
  name: 'Omega II',
  isBalanced: true,
  description: 'Advanced multi-level system for experienced counters. More accurate but requires more practice.',
  getCardValue(rank: Rank): number {
    if (rank === '2' || rank === '3' || rank === '7') return 1;
    if (rank === '4' || rank === '5' || rank === '6') return 2;
    if (rank === '9') return -1;
    if (['10', 'J', 'Q', 'K'].includes(rank)) return -2;
    if (rank === 'A' || rank === '8') return 0;
    return 0;
  },
};

/**
 * Get counting system by name
 */
export function getCountingSystem(name: CountingSystemName): CountingSystem {
  switch (name) {
    case 'Hi-Lo':
      return HiLoSystem;
    case 'KO':
      return KOSystem;
    case 'Omega II':
      return OmegaIISystem;
    default:
      return HiLoSystem;
  }
}

/**
 * Calculate running count from a list of cards
 */
export function calculateRunningCount(cards: Card[], system: CountingSystem): number {
  return cards.reduce((count, card) => {
    return count + system.getCardValue(card.rank);
  }, 0);
}

/**
 * Calculate true count from running count and remaining decks
 * True Count = Running Count / Remaining Decks
 * Only applicable for balanced systems
 */
export function calculateTrueCount(runningCount: number, remainingDecks: number): number {
  if (remainingDecks <= 0) {
    return 0;
  }
  return Math.round((runningCount / remainingDecks) * 10) / 10; // Round to 1 decimal
}

/**
 * Get betting recommendation based on true count
 * Returns multiplier for base bet (1x = min bet, higher = larger bet)
 */
export function getBettingRecommendation(trueCount: number): {
  multiplier: number;
  description: string;
} {
  if (trueCount >= 5) {
    return { multiplier: 8, description: 'Very Favorable - Max Bet' };
  } else if (trueCount >= 4) {
    return { multiplier: 6, description: 'Very Favorable' };
  } else if (trueCount >= 3) {
    return { multiplier: 4, description: 'Favorable' };
  } else if (trueCount >= 2) {
    return { multiplier: 2, description: 'Slightly Favorable' };
  } else if (trueCount >= 1) {
    return { multiplier: 1, description: 'Neutral' };
  } else if (trueCount >= 0) {
    return { multiplier: 1, description: 'Slightly Unfavorable' };
  } else {
    return { multiplier: 1, description: 'Unfavorable - Minimum Bet' };
  }
}

/**
 * Determine count level for UI display
 */
export function getCountLevel(trueCount: number): 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive' {
  if (trueCount <= -2) return 'very-negative';
  if (trueCount < 0) return 'negative';
  if (trueCount >= 3) return 'very-positive';
  if (trueCount >= 1) return 'positive';
  return 'neutral';
}
