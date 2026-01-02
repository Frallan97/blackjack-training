// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for React keys
}

// Hand Types
export interface Hand {
  cards: Card[];
  value: number; // Best value (using soft ace if possible)
  isSoft: boolean; // Contains usable ace
  isBlackjack: boolean;
  isBusted: boolean;
  canSplit: boolean;
  canDouble: boolean;
}

// Game Phase
export type GamePhase = 'betting' | 'dealing' | 'player-turn' | 'dealer-turn' | 'result';
export type GameResult = 'win' | 'loss' | 'push' | 'blackjack' | null;

// Player Actions
export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

// Game Rules
export interface GameRules {
  // Decks
  numDecks: number;
  penetration: number; // 0.75 = reshuffle at 75% dealt

  // Dealer rules
  dealerHitsOn17: boolean; // H17 vs S17

  // Player options
  canDoubleAfterSplit: boolean;
  canResplit: boolean;
  maxSplitHands: number;
  canSurrenderEarly: boolean;
  canSurrenderLate: boolean;

  // Payouts
  blackjackPayout: number; // 1.5 for 3:2, 1.2 for 6:5
  insurancePayout: number;
}

// Counting System
export type CountingSystemName = 'Hi-Lo' | 'KO' | 'Omega II';

export interface CountingSystem {
  name: CountingSystemName;
  isBalanced: boolean;
  getCardValue(rank: Rank): number;
  description: string;
}

// Strategy Decision
export interface StrategyDecision {
  action: PlayerAction;
  alternatives?: PlayerAction[]; // Other acceptable actions
  explanation?: string;
}

// Training Mode
export interface TrainingMode {
  name: string;
  description: string;
  dealSpeed: number; // ms between cards
  showCountDuringPlay: boolean;
  requireCountBeforeAction: boolean;
  showStrategyHints: boolean;
  pauseAfterMistake: boolean;
}

// Statistics
export interface AccuracyStats {
  correct: number;
  total: number;
}

export interface CountingAccuracy {
  runningCount: AccuracyStats;
  trueCount: AccuracyStats;
}

export interface StrategyAccuracyByType {
  hit: AccuracyStats;
  stand: AccuracyStats;
  double: AccuracyStats;
  split: AccuracyStats;
}

export interface StrategyAccuracy {
  overall: AccuracyStats;
  byDecisionType: StrategyAccuracyByType;
  byDealerCard: Record<Rank, AccuracyStats>;
}

export interface SessionStats {
  date: Date;
  handsPlayed: number;
  countAccuracy: number;
  strategyAccuracy: number;
  systemUsed: CountingSystemName;
  deckCount: number;
}

export interface Achievements {
  perfectHands: number; // 10 hands in a row perfect
  speedDemons: number; // Fast mode with >90% accuracy
  systemMaster: CountingSystemName[]; // Counting systems with >95% accuracy
}

export interface Statistics {
  countingAccuracy: CountingAccuracy;
  strategyAccuracy: StrategyAccuracy;
  sessions: SessionStats[];
  achievements: Achievements;
}

// Strategy Decision Record
export interface DecisionRecord {
  playerHand: Hand;
  dealerCard: Card;
  userAction: PlayerAction;
  correctAction: PlayerAction;
  wasCorrect: boolean;
  timestamp: Date;
}

// Settings
export interface Settings {
  // Game settings
  rules: GameRules;

  // Counting settings
  countingSystem: CountingSystemName;
  showCountDuringPlay: boolean;

  // Strategy settings
  strategyEnabled: boolean;
  showHints: boolean;

  // Training mode
  trainingMode: TrainingMode;
}
