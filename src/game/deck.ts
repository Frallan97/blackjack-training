import { Card, Rank, Suit } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class Deck {
  private cards: Card[] = [];
  private dealtCards: Card[] = [];
  private totalCards: number = 0;
  private penetrationThreshold: number = 0.75; // Reshuffle at 75% dealt

  constructor(numDecks: number = 6, penetration: number = 0.75) {
    this.penetrationThreshold = penetration;
    this.createDeck(numDecks);
    this.shuffle();
  }

  /**
   * Create N decks of 52 cards each
   */
  private createDeck(numDecks: number): void {
    this.cards = [];
    this.dealtCards = [];

    for (let deck = 0; deck < numDecks; deck++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push({
            suit,
            rank,
            id: `${deck}-${suit}-${rank}`, // Unique ID for React keys
          });
        }
      }
    }

    this.totalCards = this.cards.length;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffle(): void {
    const cards = [...this.cards];

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    this.cards = cards;
    this.dealtCards = [];
  }

  /**
   * Deal one card from the deck
   */
  dealCard(): Card | null {
    if (this.cards.length === 0) {
      return null;
    }

    const card = this.cards.pop();
    if (card) {
      this.dealtCards.push(card);
    }

    return card || null;
  }

  /**
   * Get number of cards remaining in the deck
   */
  getRemainingCards(): number {
    return this.cards.length;
  }

  /**
   * Get approximate number of decks remaining (for true count calculation)
   */
  getRemainingDecks(): number {
    const cardsPerDeck = 52;
    return Math.max(0.5, this.cards.length / cardsPerDeck);
  }

  /**
   * Check if deck needs to be reshuffled based on penetration
   */
  needsReshuffle(): boolean {
    const dealtPercentage = this.dealtCards.length / this.totalCards;
    return dealtPercentage >= this.penetrationThreshold;
  }

  /**
   * Reset and reshuffle the deck
   */
  reset(numDecks: number, penetration: number = 0.75): void {
    this.penetrationThreshold = penetration;
    this.createDeck(numDecks);
    this.shuffle();
  }

  /**
   * Get all dealt cards (for testing or debugging)
   */
  getDealtCards(): Card[] {
    return [...this.dealtCards];
  }

  /**
   * Get deck penetration percentage (0-1)
   */
  getPenetrationPercentage(): number {
    return this.dealtCards.length / this.totalCards;
  }
}

/**
 * Utility function to get card display name
 */
export function getCardDisplayName(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Utility function to get numeric value of a card (for basic calculations)
 * Note: Ace handling (1 or 11) is done in hand evaluation
 */
export function getCardNumericValue(rank: Rank): number {
  if (rank === 'A') return 11; // Default to 11, will be adjusted in hand evaluation
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}
