import { create } from 'zustand';
import { Hand, GamePhase, GameResult, GameRules, CountingSystemName, Card, StrategyDecision } from '../types/game';
import { Deck } from '../game/deck';
import { HandEvaluator, compareHands } from '../game/hand';
import { getCountingSystem, calculateRunningCount, calculateTrueCount } from '../game/counting';
import { getBasicStrategyDecision } from '../game/strategy';

interface GameStats {
  handsPlayed: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  totalProfit: number;
}

interface GameSettings {
  countingSystem: CountingSystemName;
  showCount: boolean;
  showStrategyHints: boolean;
}

interface GameState {
  // Deck
  deck: Deck | null;
  remainingDecks: number;

  // Hands
  dealerHand: Hand;
  playerHands: Hand[];
  currentHandIndex: number;
  handResults: (GameResult | null)[]; // Result for each hand after split

  // Game flow
  phase: GamePhase;
  result: GameResult;

  // Game rules
  rules: GameRules;

  // Counting
  runningCount: number;
  trueCount: number;
  dealtCards: Card[];

  // Strategy
  currentStrategyHint: StrategyDecision | null;

  // Betting
  bankroll: number;
  currentBet: number;

  // Statistics
  stats: GameStats;

  // Settings
  settings: GameSettings;

  // Actions
  initializeGame: (rules: GameRules) => void;
  startNewRound: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  dealerPlay: () => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateRules: (rules: Partial<GameRules>) => void;
  resetStats: () => void;
  setBet: (amount: number) => void;
  resetBankroll: () => void;
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

const loadSettings = (): GameSettings => {
  const saved = localStorage.getItem('blackjack-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }
  return {
    countingSystem: 'Hi-Lo',
    showCount: true,
    showStrategyHints: true,
  };
};

const loadStats = (): GameStats => {
  const saved = localStorage.getItem('blackjack-stats');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure totalProfit exists for backward compatibility
      return {
        ...parsed,
        totalProfit: parsed.totalProfit ?? 0,
      };
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }
  return {
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    totalProfit: 0,
  };
};

const loadBankroll = (): number => {
  const saved = localStorage.getItem('blackjack-bankroll');
  if (saved) {
    try {
      return parseInt(saved, 10);
    } catch (e) {
      console.error('Failed to load bankroll', e);
    }
  }
  return 10000; // Default starting bankroll
};

const saveBankroll = (bankroll: number) => {
  localStorage.setItem('blackjack-bankroll', bankroll.toString());
};

const saveSettings = (settings: GameSettings) => {
  localStorage.setItem('blackjack-settings', JSON.stringify(settings));
};

const saveStats = (stats: GameStats) => {
  localStorage.setItem('blackjack-stats', JSON.stringify(stats));
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  deck: null,
  remainingDecks: 0,
  dealerHand: HandEvaluator.createEmptyHand(),
  playerHands: [HandEvaluator.createEmptyHand()],
  currentHandIndex: 0,
  handResults: [],
  phase: 'betting',
  result: null,
  rules: defaultRules,
  runningCount: 0,
  trueCount: 0,
  dealtCards: [],
  currentStrategyHint: null,
  bankroll: loadBankroll(),
  currentBet: 100,
  stats: loadStats(),
  settings: loadSettings(),

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
      runningCount: 0,
      trueCount: 0,
      dealtCards: [],
      currentStrategyHint: null,
    });
  },

  // Start a new round
  startNewRound: () => {
    const { deck, rules, settings, dealtCards } = get();

    if (!deck) {
      return;
    }

    // Check if deck needs reshuffle
    if (deck.needsReshuffle()) {
      deck.reset(rules.numDecks, rules.penetration);
      // Reset count on reshuffle
      set({ runningCount: 0, trueCount: 0, dealtCards: [] });
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

    // Update dealt cards and count
    const newDealtCards = [...dealtCards, playerCard1, dealerCard1, playerCard2, dealerCard2];
    const countingSystem = getCountingSystem(settings.countingSystem);
    const runningCount = calculateRunningCount(newDealtCards, countingSystem);
    const remainingDecks = deck.getRemainingDecks();
    const trueCount = calculateTrueCount(runningCount, remainingDecks);

    // Calculate strategy hint
    const strategyHint = settings.showStrategyHints
      ? getBasicStrategyDecision(playerHand, dealerCard1, rules)
      : null;

    set({
      dealerHand,
      playerHands: [playerHand],
      currentHandIndex: 0,
      phase: 'player-turn',
      result: null,
      remainingDecks,
      dealtCards: newDealtCards,
      runningCount,
      trueCount,
      currentStrategyHint: strategyHint,
    });

    // Check for immediate blackjack
    const { currentBet, bankroll: currentBankroll } = get();

    if (playerHand.isBlackjack && dealerHand.isBlackjack) {
      // Push - no bankroll change
      const updatedStats = {
        ...get().stats,
        handsPlayed: get().stats.handsPlayed + 1,
        pushes: get().stats.pushes + 1
      };
      set({ phase: 'result', result: 'push', stats: updatedStats, handResults: ['push'] });
      saveStats(updatedStats);
    } else if (playerHand.isBlackjack) {
      // Player blackjack - win 1.5x bet
      const profit = currentBet * rules.blackjackPayout;
      const newBankroll = currentBankroll + profit;
      const updatedStats = {
        ...get().stats,
        handsPlayed: get().stats.handsPlayed + 1,
        wins: get().stats.wins + 1,
        blackjacks: get().stats.blackjacks + 1,
        totalProfit: get().stats.totalProfit + profit
      };
      set({ phase: 'result', result: 'blackjack', stats: updatedStats, bankroll: newBankroll, handResults: ['blackjack'] });
      saveStats(updatedStats);
      saveBankroll(newBankroll);
    } else if (dealerHand.isBlackjack) {
      // Dealer blackjack - lose bet
      const loss = -currentBet;
      const newBankroll = currentBankroll + loss;
      const updatedStats = {
        ...get().stats,
        handsPlayed: get().stats.handsPlayed + 1,
        losses: get().stats.losses + 1,
        totalProfit: get().stats.totalProfit + loss
      };
      set({ phase: 'result', result: 'loss', stats: updatedStats, bankroll: newBankroll, handResults: ['loss'] });
      saveStats(updatedStats);
      saveBankroll(newBankroll);
    }
  },

  // Hit - take another card
  hit: () => {
    const { deck, playerHands, currentHandIndex, rules, phase, dealtCards, settings, dealerHand } = get();

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

    // Update count
    const newDealtCards = [...dealtCards, card];
    const countingSystem = getCountingSystem(settings.countingSystem);
    const runningCount = calculateRunningCount(newDealtCards, countingSystem);
    const remainingDecks = deck.getRemainingDecks();
    const trueCount = calculateTrueCount(runningCount, remainingDecks);

    // Update strategy hint
    const strategyHint = settings.showStrategyHints && !newHand.isBusted
      ? getBasicStrategyDecision(newHand, dealerHand.cards[0], rules)
      : null;

    set({
      playerHands: newPlayerHands,
      remainingDecks,
      dealtCards: newDealtCards,
      runningCount,
      trueCount,
      currentStrategyHint: strategyHint,
    });

    // If busted, move to next hand or dealer turn
    if (newHand.isBusted) {
      get().stand();
    }
  },

  // Stand - end current hand
  stand: () => {
    const { playerHands, currentHandIndex, settings, dealerHand, rules } = get();

    // If there are more hands to play (from split), move to next hand
    if (currentHandIndex < playerHands.length - 1) {
      const nextHandIndex = currentHandIndex + 1;
      const nextHand = playerHands[nextHandIndex];

      // Update strategy hint for next hand
      const strategyHint = settings.showStrategyHints && !nextHand.isBusted && !nextHand.isBlackjack
        ? getBasicStrategyDecision(nextHand, dealerHand.cards[0], rules)
        : null;

      set({
        currentHandIndex: nextHandIndex,
        currentStrategyHint: strategyHint,
      });
    } else {
      // All player hands complete, move to dealer turn
      set({ phase: 'dealer-turn', currentStrategyHint: null });
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
    const { deck, dealerHand, playerHands, rules, dealtCards, settings } = get();

    if (!deck) {
      return;
    }

    let currentDealerHand = dealerHand;
    let newDealtCards = [...dealtCards];

    // Dealer plays only if at least one player hand is not busted
    const hasActivePlayerHand = playerHands.some((hand) => !hand.isBusted);

    if (!hasActivePlayerHand) {
      // All player hands busted, dealer wins without playing
      const updatedStats = { ...get().stats, handsPlayed: get().stats.handsPlayed + 1, losses: get().stats.losses + 1 };
      set({ phase: 'result', result: 'loss', stats: updatedStats });
      saveStats(updatedStats);
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

      newDealtCards.push(card);
      currentDealerHand = HandEvaluator.addCardToHand(
        currentDealerHand,
        card,
        rules
      );
    }

    // Update count with dealer's cards
    const countingSystem = getCountingSystem(settings.countingSystem);
    const runningCount = calculateRunningCount(newDealtCards, countingSystem);
    const remainingDecks = deck.getRemainingDecks();
    const trueCount = calculateTrueCount(runningCount, remainingDecks);

    // Determine result for EACH hand (important for splits)
    const handResults: (GameResult | null)[] = playerHands.map((playerHand) => {
      if (playerHand.isBusted) {
        return 'loss';
      }

      const comparison = compareHands(playerHand, currentDealerHand);

      if (playerHand.isBlackjack && playerHands.length === 1) {
        // Only count as blackjack if it's not from a split
        return 'blackjack';
      } else if (comparison === 'player') {
        return 'win';
      } else if (comparison === 'dealer') {
        return 'loss';
      } else {
        return 'push';
      }
    });

    // Calculate profit/loss
    const { currentBet, bankroll, rules: gameRules } = get();
    let netProfit = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalPushes = 0;
    let totalBlackjacks = 0;

    handResults.forEach((handResult) => {
      if (handResult === 'blackjack') {
        netProfit += currentBet * gameRules.blackjackPayout;
        totalWins += 1;
        totalBlackjacks += 1;
      } else if (handResult === 'win') {
        netProfit += currentBet;
        totalWins += 1;
      } else if (handResult === 'loss') {
        netProfit -= currentBet;
        totalLosses += 1;
      } else if (handResult === 'push') {
        // No change to bankroll
        totalPushes += 1;
      }
    });

    // Update statistics
    const currentStats = get().stats;
    const updatedStats = {
      ...currentStats,
      handsPlayed: currentStats.handsPlayed + playerHands.length,
      wins: currentStats.wins + totalWins,
      losses: currentStats.losses + totalLosses,
      pushes: currentStats.pushes + totalPushes,
      blackjacks: currentStats.blackjacks + totalBlackjacks,
      totalProfit: currentStats.totalProfit + netProfit,
    };

    // Update bankroll
    const newBankroll = bankroll + netProfit;

    // For the main result display, use the first hand's result
    const mainResult = handResults[0] || 'loss';

    set({
      dealerHand: currentDealerHand,
      phase: 'result',
      result: mainResult,
      handResults,
      remainingDecks,
      dealtCards: newDealtCards,
      runningCount,
      trueCount,
      stats: updatedStats,
      bankroll: newBankroll,
      currentStrategyHint: null,
    });

    saveStats(updatedStats);
    saveBankroll(newBankroll);
  },

  // Reset game to initial state
  resetGame: () => {
    const { rules } = get();
    get().initializeGame(rules);
  },

  // Update settings
  updateSettings: (newSettings: Partial<GameSettings>) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    saveSettings(settings);
  },

  // Update rules
  updateRules: (newRules: Partial<GameRules>) => {
    const rules = { ...get().rules, ...newRules };
    set({ rules });
    // Reinitialize game with new rules
    get().initializeGame(rules);
  },

  // Reset statistics
  resetStats: () => {
    const freshStats: GameStats = {
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      totalProfit: 0,
    };
    set({ stats: freshStats });
    saveStats(freshStats);
  },

  // Set bet amount
  setBet: (amount: number) => {
    set({ currentBet: Math.max(10, Math.min(amount, get().bankroll)) }); // Min 10, max bankroll
  },

  // Reset bankroll
  resetBankroll: () => {
    const defaultBankroll = 10000;
    set({ bankroll: defaultBankroll });
    saveBankroll(defaultBankroll);
  },
}));
