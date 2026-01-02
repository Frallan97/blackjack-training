import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DealerArea } from './DealerArea';
import { PlayerArea } from './PlayerArea';
import { GameControls } from './GameControls';
import { CountDisplay } from './CountDisplay';
import { StatsPanel } from './StatsPanel';
import { SettingsPanel } from './SettingsPanel';
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
        'min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900',
        'flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="bg-black/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white">
              Blackjack Card Counting Trainer
            </h1>
            <p className="text-white/70 mt-1 text-sm">Master card counting and basic strategy</p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            ⚙️ Settings
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
      <div className="flex-1 flex gap-6 p-6 max-w-[1600px] mx-auto w-full">
        {/* Left Sidebar - Statistics */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <StatsPanel />
          <CountDisplay />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Dealer area */}
          <DealerArea hand={dealerHand} showHoleCard={showDealerHoleCard} />

          {/* Center info */}
          <div className="flex items-center justify-center py-4">
            <div className="bg-black/30 px-6 py-3 rounded-lg">
              <div className="text-white text-sm font-medium">
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
