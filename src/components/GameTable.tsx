import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { DealerArea } from './DealerArea';
import { PlayerArea } from './PlayerArea';
import { GameControls } from './GameControls';
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
    initializeGame,
    startNewRound,
    hit,
    stand,
    double,
    split,
  } = useGameStore();

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
      <div className="bg-black/20 p-4 text-center">
        <h1 className="text-3xl font-bold text-white">
          Blackjack Card Counting Trainer
        </h1>
        <p className="text-white/70 mt-2">Master card counting and basic strategy</p>
      </div>

      {/* Game table */}
      <div className="flex-1 flex flex-col justify-between p-8 max-w-6xl mx-auto w-full">
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
          onHit={hit}
          onStand={stand}
          onDouble={double}
          onSplit={split}
          onNewRound={startNewRound}
          onInitializeGame={handleInitialize}
        />
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
