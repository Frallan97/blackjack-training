import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DealerArea } from './DealerArea';
import { PlayerArea } from './PlayerArea';
import { GameControls } from './GameControls';
import { CountDisplay } from './CountDisplay';
import { StatsPanel } from './StatsPanel';
import { SettingsPanel } from './SettingsPanel';
import { BetControls } from './BetControls';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface GameTableProps {
  className?: string;
}

export const GameTable: React.FC<GameTableProps> = ({ className }) => {
  const {
    dealerHand,
    playerHands,
    currentHandIndex,
    phase,
    result,
    rules,
    currentStrategyHint,
    initializeGame,
    startNewRound,
    hit,
    stand,
    double,
    split,
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);

  const currentHand = playerHands[currentHandIndex] || playerHands[0];
  const showDealerHoleCard = phase === 'dealer-turn' || phase === 'result';

  const handleInitialize = () => {
    initializeGame(rules);
    startNewRound();
  };

  return (
    <div
      className={cn(
        'min-h-screen w-full bg-gradient-to-br from-green-800 via-green-700 to-green-900',
        'flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="bg-black/20 p-3 md:p-4">
        <div className="px-2 md:px-6 flex items-center justify-between gap-2">
          <div className="text-center flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-white">
              Blackjack Card Counting Trainer
            </h1>
            <p className="text-white/70 mt-1 text-xs md:text-sm hidden sm:block">Master card counting and basic strategy</p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white/20 text-xs md:text-sm font-semibold"
          >
            <span className="hidden sm:inline">⚙️ </span>Settings
          </Button>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}

      {/* Game table */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-6 p-3 md:p-6 w-full">
        {/* Left Sidebar - Statistics (hidden on mobile, shown on lg+) */}
        <div className="hidden lg:flex lg:w-80 flex-shrink-0 flex-col gap-4">
          <BetControls />
          <StatsPanel />
          <CountDisplay />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Dealer area */}
          <DealerArea hand={dealerHand} showHoleCard={showDealerHoleCard} />

          {/* Mobile stats - shown only on mobile */}
          <div className="lg:hidden space-y-3 mb-4">
            <BetControls />
            <div className="grid grid-cols-2 gap-3">
              <CountDisplay />
              <StatsPanel className="col-span-1" />
            </div>
          </div>

          {/* Center info */}
          <div className="flex items-center justify-center py-2 md:py-4">
            <div className="bg-black/30 px-4 md:px-6 py-2 md:py-3 rounded-lg">
              <div className="text-white text-xs md:text-sm font-medium">
                Phase:{' '}
                <span className="text-yellow-400">
                  {phase === 'betting' && 'Waiting to start'}
                  {phase === 'dealing' && 'Dealing cards'}
                  {phase === 'player-turn' && 'Your turn'}
                  {phase === 'dealer-turn' && 'Dealer playing'}
                  {phase === 'result' && 'Round complete'}
                </span>
              </div>
            </div>
          </div>

          {/* Player area */}
          <PlayerArea
            hands={playerHands}
            currentHandIndex={currentHandIndex}
          />

          {/* Controls */}
          <GameControls
            phase={phase}
            result={result}
            currentHand={currentHand}
            strategyHint={currentStrategyHint}
            onHit={hit}
            onStand={stand}
            onDouble={double}
            onSplit={split}
            onNewRound={startNewRound}
            onInitializeGame={handleInitialize}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/20 p-3 text-center text-white/50 text-sm">
        <p>
          Educational purposes only. Practice responsibly.
        </p>
      </div>
    </div>
  );
};
