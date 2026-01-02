import { create } from 'zustand';
import { Hand, GamePhase, GameResult, GameRules } from '../types/game';
import { Deck } from '../game/deck';
import { HandEvaluator, compareHands } from '../game/hand';

interface GameState {
  // Deck
  deck: Deck | null;
  remainingDecks: number;

  // Hands
  dealerHand: Hand;
  playerHands: Hand[];
  currentHandIndex: number;

  // Game flow
  phase: GamePhase;
  result: GameResult;

  // Game rules
  rules: GameRules;

  // Actions
  initializeGame: (rules: GameRules) => void;
  startNewRound: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  dealerPlay: () => void;
  resetGame: () => void;
}

const defaultRules: GameRules = {
  numDecks: 6,
  penetration: 0.75,
  dealerHitsOn17: true, // H17
  canDoubleAfterSplit: true,
  canResplit: false,
  maxSplitHands: 2,
  canSurrenderEarly: false,
  canSurrenderLate: false,
  blackjackPayout: 1.5, // 3:2
  insurancePayout: 2,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  deck: null,
  remainingDecks: 0,
  dealerHand: HandEvaluator.createEmptyHand(),
  playerHands: [HandEvaluator.createEmptyHand()],
  currentHandIndex: 0,
  phase: 'betting',
  result: null,
  rules: defaultRules,

  // Initialize game with rules
  initializeGame: (rules: GameRules) => {
    const deck = new Deck(rules.numDecks, rules.penetration);

    set({
      deck,
      remainingDecks: deck.getRemainingDecks(),
      dealerHand: HandEvaluator.createEmptyHand(),
      playerHands: [HandEvaluator.createEmptyHand()],
      currentHandIndex: 0,
      phase: 'betting',
      result: null,
      rules,
    });
  },

  // Start a new round
  startNewRound: () => {
    const { deck, rules } = get();

    if (!deck) {
      return;
    }

    // Check if deck needs reshuffle
    if (deck.needsReshuffle()) {
      deck.reset(rules.numDecks, rules.penetration);
    }

    // Deal initial cards (player, dealer, player, dealer)
    const playerCard1 = deck.dealCard();
    const dealerCard1 = deck.dealCard();
    const playerCard2 = deck.dealCard();
    const dealerCard2 = deck.dealCard();

    if (!playerCard1 || !playerCard2 || !dealerCard1 || !dealerCard2) {
      console.error('Failed to deal initial cards');
      return;
    }

    const playerHand = HandEvaluator.evaluateHand(
      [playerCard1, playerCard2],
      rules
    );
    const dealerHand = HandEvaluator.evaluateHand([dealerCard1, dealerCard2], rules);

    set({
      dealerHand,
      playerHands: [playerHand],
      currentHandIndex: 0,
      phase: 'player-turn',
      result: null,
      remainingDecks: deck.getRemainingDecks(),
    });

    // Check for immediate blackjack
    if (playerHand.isBlackjack && dealerHand.isBlackjack) {
      set({ phase: 'result', result: 'push' });
    } else if (playerHand.isBlackjack) {
      set({ phase: 'result', result: 'blackjack' });
    } else if (dealerHand.isBlackjack) {
      set({ phase: 'result', result: 'loss' });
    }
  },

  // Hit - take another card
  hit: () => {
    const { deck, playerHands, currentHandIndex, rules, phase } = get();

    if (phase !== 'player-turn' || !deck) {
      return;
    }

    const card = deck.dealCard();
    if (!card) {
      return;
    }

    const currentHand = playerHands[currentHandIndex];
    const newHand = HandEvaluator.addCardToHand(currentHand, card, rules);

    const newPlayerHands = [...playerHands];
    newPlayerHands[currentHandIndex] = newHand;

    set({
      playerHands: newPlayerHands,
      remainingDecks: deck.getRemainingDecks(),
    });

    // If busted, move to next hand or dealer turn
    if (newHand.isBusted) {
      get().stand();
    }
  },

  // Stand - end current hand
  stand: () => {
    const { playerHands, currentHandIndex } = get();

    // If there are more hands to play (from split), move to next hand
    if (currentHandIndex < playerHands.length - 1) {
      set({ currentHandIndex: currentHandIndex + 1 });
    } else {
      // All player hands complete, move to dealer turn
      set({ phase: 'dealer-turn' });
      get().dealerPlay();
    }
  },

  // Double - double bet, take one card, then stand
  double: () => {
    const { playerHands, currentHandIndex, rules } = get();
    const currentHand = playerHands[currentHandIndex];

    if (!currentHand.canDouble) {
      return;
    }

    // Hit once
    get().hit();

    // Then stand
    setTimeout(() => {
      get().stand();
    }, 100);
  },

  // Split - split pair into two hands
  split: () => {
    const { deck, playerHands, currentHandIndex, rules } = get();

    if (!deck) {
      return;
    }

    const currentHand = playerHands[currentHandIndex];

    if (!currentHand.canSplit || playerHands.length >= rules.maxSplitHands) {
      return;
    }

    // Split the hand
    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];

    // Deal new cards to each split hand
    const newCard1 = deck.dealCard();
    const newCard2 = deck.dealCard();

    if (!newCard1 || !newCard2) {
      return;
    }

    const hand1 = HandEvaluator.evaluateHand([card1, newCard1], rules);
    const hand2 = HandEvaluator.evaluateHand([card2, newCard2], rules);

    const newPlayerHands = [...playerHands];
    newPlayerHands[currentHandIndex] = hand1;
    newPlayerHands.splice(currentHandIndex + 1, 0, hand2);

    set({
      playerHands: newPlayerHands,
      remainingDecks: deck.getRemainingDecks(),
    });
  },

  // Dealer plays according to rules
  dealerPlay: () => {
    const { deck, dealerHand, playerHands, rules } = get();

    if (!deck) {
      return;
    }

    let currentDealerHand = dealerHand;

    // Dealer plays only if at least one player hand is not busted
    const hasActivePlayerHand = playerHands.some((hand) => !hand.isBusted);

    if (!hasActivePlayerHand) {
      // All player hands busted, dealer wins without playing
      set({ phase: 'result', result: 'loss' });
      return;
    }

    // Dealer draws cards according to rules
    while (
      HandEvaluator.shouldDealerHit(currentDealerHand, rules.dealerHitsOn17)
    ) {
      const card = deck.dealCard();
      if (!card) {
        break;
      }

      currentDealerHand = HandEvaluator.addCardToHand(
        currentDealerHand,
        card,
        rules
      );
    }

    // Determine result for each hand (for now, just use first hand)
    const playerHand = playerHands[0];
    const comparison = compareHands(playerHand, currentDealerHand);

    let result: GameResult;
    if (playerHand.isBlackjack) {
      result = 'blackjack';
    } else if (comparison === 'player') {
      result = 'win';
    } else if (comparison === 'dealer') {
      result = 'loss';
    } else {
      result = 'push';
    }

    set({
      dealerHand: currentDealerHand,
      phase: 'result',
      result,
      remainingDecks: deck.getRemainingDecks(),
    });
  },

  // Reset game to initial state
  resetGame: () => {
    const { rules } = get();
    get().initializeGame(rules);
  },
}));
