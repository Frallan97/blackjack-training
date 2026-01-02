import { Hand, Card, PlayerAction, StrategyDecision, Rank, GameRules } from '../types/game';

/**
 * Basic Strategy for Blackjack
 * Based on standard multi-deck (4-8 decks) H17 rules
 */

type ActionShorthand = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'Ph' | 'Rh' | 'Rs';

// Action key:
// H = Hit
// S = Stand
// D = Double if allowed, otherwise Hit
// Ds = Double if allowed, otherwise Stand
// P = Split
// Ph = Split if Double After Split allowed, otherwise Hit
// Rh = Surrender if allowed, otherwise Hit
// Rs = Surrender if allowed, otherwise Stand

const HARD_TOTALS: Record<number, Record<Rank, ActionShorthand>> = {
  // Hard 5-8: Always hit
  5: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  6: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  7: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  8: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Hard 9: Double vs 3-6
  9: { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Hard 10: Double vs 2-9
  10: { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Hard 11: Double vs 2-10 (H17 rules)
  11: { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'D', 'J': 'D', 'Q': 'D', 'K': 'D', 'A': 'H' },
  // Hard 12: Stand vs 4-6
  12: { '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Hard 13-16: Stand vs 2-6
  13: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  14: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  15: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'Rh', 'J': 'Rh', 'Q': 'Rh', 'K': 'Rh', 'A': 'H' },
  16: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'Rh', '10': 'Rh', 'J': 'Rh', 'Q': 'Rh', 'K': 'Rh', 'A': 'Rh' },
  // Hard 17+: Always stand
  17: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  18: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  19: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  20: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  21: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
};

const SOFT_TOTALS: Record<number, Record<Rank, ActionShorthand>> = {
  // Soft 13-14: Hit vs all except double vs 5-6
  13: { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  14: { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Soft 15-16: Double vs 4-6
  15: { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  16: { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Soft 17: Double vs 3-6
  17: { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Soft 18: Stand vs 2,7,8 / Double vs 3-6 / Hit vs 9,10,A
  18: { '2': 'S', '3': 'Ds', '4': 'Ds', '5': 'Ds', '6': 'Ds', '7': 'S', '8': 'S', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Soft 19+: Always stand
  19: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  20: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  21: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
};

const PAIR_SPLITS: Record<Rank, Record<Rank, ActionShorthand>> = {
  // Always split Aces and 8s
  'A': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'J': 'P', 'Q': 'P', 'K': 'P', 'A': 'P' },
  '8': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'J': 'P', 'Q': 'P', 'K': 'P', 'A': 'P' },
  // Never split 5s and 10s
  '5': { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  '10': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  'J': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  'Q': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  'K': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
  // Split 2s, 3s vs 2-7
  '2': { '2': 'Ph', '3': 'Ph', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  '3': { '2': 'Ph', '3': 'Ph', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Split 4s vs 5-6 (if DAS)
  '4': { '2': 'H', '3': 'H', '4': 'H', '5': 'Ph', '6': 'Ph', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Split 6s vs 2-6
  '6': { '2': 'Ph', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Split 7s vs 2-7
  '7': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'J': 'H', 'Q': 'H', 'K': 'H', 'A': 'H' },
  // Split 9s vs 2-9 except 7
  '9': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'S', '8': 'P', '9': 'P', '10': 'S', 'J': 'S', 'Q': 'S', 'K': 'S', 'A': 'S' },
};

function convertShorthand(shorthand: ActionShorthand, canDouble: boolean, canSurrender: boolean, canDoubleAfterSplit: boolean, isPair: boolean): PlayerAction {
  switch (shorthand) {
    case 'H':
      return 'hit';
    case 'S':
      return 'stand';
    case 'D':
      return canDouble ? 'double' : 'hit';
    case 'Ds':
      return canDouble ? 'double' : 'stand';
    case 'P':
      return 'split';
    case 'Ph':
      return (isPair && canDoubleAfterSplit) ? 'split' : 'hit';
    case 'Rh':
      return canSurrender ? 'surrender' : 'hit';
    case 'Rs':
      return canSurrender ? 'surrender' : 'stand';
    default:
      return 'hit';
  }
}

function normalizeDealerCard(rank: Rank): Rank {
  // Normalize face cards to '10'
  if (['J', 'Q', 'K'].includes(rank)) {
    return '10';
  }
  return rank;
}

/**
 * Get the basic strategy decision for a given situation
 */
export function getBasicStrategyDecision(
  playerHand: Hand,
  dealerUpCard: Card,
  rules: GameRules
): StrategyDecision {
  const dealerRank = normalizeDealerCard(dealerUpCard.rank);
  const canDouble = playerHand.canDouble;
  const canSurrender = rules.canSurrenderLate;
  const canDoubleAfterSplit = rules.canDoubleAfterSplit;

  // Check for pair
  if (playerHand.canSplit && playerHand.cards.length === 2) {
    const pairRank = playerHand.cards[0].rank;
    const normalizedPairRank = normalizeDealerCard(pairRank);

    if (PAIR_SPLITS[normalizedPairRank] && PAIR_SPLITS[normalizedPairRank][dealerRank]) {
      const shorthand = PAIR_SPLITS[normalizedPairRank][dealerRank];
      const action = convertShorthand(shorthand, canDouble, canSurrender, canDoubleAfterSplit, true);

      return {
        action,
        explanation: getExplanation(action, playerHand.value, playerHand.isSoft, dealerUpCard.rank, true),
      };
    }
  }

  // Check for soft hand
  if (playerHand.isSoft && SOFT_TOTALS[playerHand.value]) {
    const shorthand = SOFT_TOTALS[playerHand.value][dealerRank];
    const action = convertShorthand(shorthand, canDouble, canSurrender, canDoubleAfterSplit, false);

    return {
      action,
      explanation: getExplanation(action, playerHand.value, playerHand.isSoft, dealerUpCard.rank, false),
    };
  }

  // Hard total
  const hardValue = Math.min(playerHand.value, 21);
  if (HARD_TOTALS[hardValue]) {
    const shorthand = HARD_TOTALS[hardValue][dealerRank];
    const action = convertShorthand(shorthand, canDouble, canSurrender, canDoubleAfterSplit, false);

    return {
      action,
      explanation: getExplanation(action, playerHand.value, playerHand.isSoft, dealerUpCard.rank, false),
    };
  }

  // Default to hit for low totals
  return {
    action: 'hit',
    explanation: 'Hit to improve your hand',
  };
}

function getExplanation(action: PlayerAction, handValue: number, isSoft: boolean, dealerRank: Rank, isPair: boolean): string {
  const handType = isPair ? 'pair' : isSoft ? 'soft' : 'hard';
  const handDesc = isPair ? `pair` : isSoft ? `soft ${handValue}` : `${handValue}`;

  switch (action) {
    case 'hit':
      return `Hit with ${handDesc} vs dealer ${dealerRank}`;
    case 'stand':
      return `Stand with ${handDesc} vs dealer ${dealerRank}`;
    case 'double':
      return `Double down with ${handDesc} vs dealer ${dealerRank}`;
    case 'split':
      return `Split ${handDesc} vs dealer ${dealerRank}`;
    case 'surrender':
      return `Surrender ${handDesc} vs dealer ${dealerRank}`;
    default:
      return '';
  }
}

/**
 * Check if a player's action matches the basic strategy
 */
export function isCorrectBasicStrategy(
  playerAction: PlayerAction,
  playerHand: Hand,
  dealerUpCard: Card,
  rules: GameRules
): boolean {
  const correctDecision = getBasicStrategyDecision(playerHand, dealerUpCard, rules);
  return playerAction === correctDecision.action;
}
