import { Card, Hand, GameRules, Rank } from '../types/game';
import { getCardNumericValue } from './deck';

export class HandEvaluator {
  /**
   * Calculate the best value for a hand
   * Returns the highest value <= 21, or the lowest value if all bust
   */
  static calculateValue(cards: Card[]): { value: number; isSoft: boolean } {
    if (cards.length === 0) {
      return { value: 0, isSoft: false };
    }

    let value = 0;
    let aces = 0;

    // Count aces and add up other cards
    for (const card of cards) {
      if (card.rank === 'A') {
        aces++;
        value += 11; // Start with ace as 11
      } else {
        value += getCardNumericValue(card.rank);
      }
    }

    // Adjust aces from 11 to 1 if needed to avoid bust
    while (value > 21 && aces > 0) {
      value -= 10; // Convert one ace from 11 to 1
      aces--;
    }

    // Hand is soft if it contains an ace counted as 11
    const isSoft = aces > 0 && value <= 21;

    return { value, isSoft };
  }

  /**
   * Check if hand is blackjack (21 with exactly 2 cards: Ace + 10-value card)
   */
  static checkBlackjack(cards: Card[]): boolean {
    if (cards.length !== 2) {
      return false;
    }

    const hasAce = cards.some((card) => card.rank === 'A');
    const hasTen = cards.some((card) =>
      ['10', 'J', 'Q', 'K'].includes(card.rank)
    );

    return hasAce && hasTen;
  }

  /**
   * Check if hand is busted (value > 21)
   */
  static checkBust(value: number): boolean {
    return value > 21;
  }

  /**
   * Check if player can split this hand
   * Can split if hand has exactly 2 cards of the same rank
   */
  static canSplit(cards: Card[], rules: GameRules): boolean {
    if (cards.length !== 2) {
      return false;
    }

    // Check if both cards have same rank
    const rank1 = cards[0].rank;
    const rank2 = cards[1].rank;

    // Exact rank match
    if (rank1 === rank2) {
      return true;
    }

    // Some casinos allow splitting any 10-value cards
    // For now, we'll require exact rank match
    return false;
  }

  /**
   * Check if player can double down on this hand
   * Standard rules: can double on first two cards only
   */
  static canDouble(cards: Card[], rules: GameRules): boolean {
    // Can only double on first two cards
    if (cards.length !== 2) {
      return false;
    }

    // Some casinos restrict doubling to certain totals (9-11)
    // For now, allow doubling on any two cards (most liberal rule)
    return true;
  }

  /**
   * Evaluate a hand and return full Hand object with all properties
   */
  static evaluateHand(cards: Card[], rules: GameRules): Hand {
    const { value, isSoft } = this.calculateValue(cards);
    const isBlackjack = this.checkBlackjack(cards);
    const isBusted = this.checkBust(value);
    const canSplit = this.canSplit(cards, rules);
    const canDouble = this.canDouble(cards, rules);

    return {
      cards,
      value,
      isSoft,
      isBlackjack,
      isBusted,
      canSplit,
      canDouble,
    };
  }

  /**
   * Create an empty hand
   */
  static createEmptyHand(): Hand {
    return {
      cards: [],
      value: 0,
      isSoft: false,
      isBlackjack: false,
      isBusted: false,
      canSplit: false,
      canDouble: false,
    };
  }

  /**
   * Add a card to a hand and return updated hand
   */
  static addCardToHand(hand: Hand, card: Card, rules: GameRules): Hand {
    const newCards = [...hand.cards, card];
    return this.evaluateHand(newCards, rules);
  }

  /**
   * Get a string representation of hand value
   * Shows soft hands as "Soft 17" vs "Hard 17"
   */
  static getHandValueString(hand: Hand): string {
    if (hand.isBlackjack) {
      return 'Blackjack!';
    }

    if (hand.isBusted) {
      return `Bust (${hand.value})`;
    }

    const prefix = hand.isSoft ? 'Soft' : '';
    return `${prefix} ${hand.value}`.trim();
  }

  /**
   * Determine if dealer should hit based on their hand
   * Standard rule: dealer hits on 16 or less, stands on 17+
   * H17 rule: dealer hits on soft 17
   */
  static shouldDealerHit(hand: Hand, dealerHitsOn17: boolean): boolean {
    if (hand.isBusted) {
      return false;
    }

    if (hand.value < 17) {
      return true;
    }

    if (hand.value === 17 && hand.isSoft && dealerHitsOn17) {
      return true;
    }

    return false;
  }
}

/**
 * Utility function to get the best hand description for display
 */
export function getHandDescription(hand: Hand): string {
  if (hand.cards.length === 0) {
    return 'Empty hand';
  }

  const valueStr = HandEvaluator.getHandValueString(hand);

  if (hand.canSplit) {
    return `${valueStr} (Can split)`;
  }

  if (hand.canDouble && hand.cards.length === 2) {
    return `${valueStr} (Can double)`;
  }

  return valueStr;
}

/**
 * Compare two hands to determine winner
 * Returns: 'player' | 'dealer' | 'push'
 */
export function compareHands(
  playerHand: Hand,
  dealerHand: Hand
): 'player' | 'dealer' | 'push' {
  // Player busted = dealer wins
  if (playerHand.isBusted) {
    return 'dealer';
  }

  // Dealer busted = player wins
  if (dealerHand.isBusted) {
    return 'player';
  }

  // Player blackjack beats dealer 21 (but not dealer blackjack)
  if (playerHand.isBlackjack && !dealerHand.isBlackjack) {
    return 'player';
  }

  // Dealer blackjack beats player 21 (but not player blackjack)
  if (dealerHand.isBlackjack && !playerHand.isBlackjack) {
    return 'dealer';
  }

  // Both blackjack = push
  if (playerHand.isBlackjack && dealerHand.isBlackjack) {
    return 'push';
  }

  // Compare values
  if (playerHand.value > dealerHand.value) {
    return 'player';
  }

  if (dealerHand.value > playerHand.value) {
    return 'dealer';
  }

  // Same value = push
  return 'push';
}
