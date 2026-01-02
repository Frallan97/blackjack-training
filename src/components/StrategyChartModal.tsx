import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface StrategyChartModalProps {
  onClose: () => void;
}

export const StrategyChartModal: React.FC<StrategyChartModalProps> = ({ onClose }) => {
  // Dealer up cards
  const dealerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

  // Hard totals strategy (rows are player totals)
  const hardTotals = [
    { total: '17-20', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { total: '16', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { total: '15', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { total: '13-14', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { total: '12', actions: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { total: '11', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'] },
    { total: '10', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
    { total: '9', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { total: '5-8', actions: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'] },
  ];

  // Soft totals strategy
  const softTotals = [
    { total: 'A,9', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { total: 'A,8', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { total: 'A,7', actions: ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'] },
    { total: 'A,6', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { total: 'A,4-5', actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { total: 'A,2-3', actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
  ];

  // Pair splits strategy
  const pairSplits = [
    { total: 'A,A', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { total: '10,10', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { total: '9,9', actions: ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'] },
    { total: '8,8', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { total: '7,7', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
    { total: '6,6', actions: ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
    { total: '5,5', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
    { total: '4,4', actions: ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
    { total: '2,2-3,3', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'H': return 'bg-blue-600 text-white';
      case 'S': return 'bg-red-600 text-white';
      case 'D': return 'bg-yellow-600 text-white';
      case 'P': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Basic Strategy Chart</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Legend */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-white/70 text-sm font-semibold mb-2">Legend:</div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold', getActionColor('H'))}>H</div>
                <span className="text-white text-sm">Hit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold', getActionColor('S'))}>S</div>
                <span className="text-white text-sm">Stand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold', getActionColor('D'))}>D</div>
                <span className="text-white text-sm">Double (Hit if can't double)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold', getActionColor('P'))}>P</div>
                <span className="text-white text-sm">Split</span>
              </div>
            </div>
          </div>

          {/* Hard Totals */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Hard Totals</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">Your Hand</th>
                    {dealerCards.map(card => (
                      <th key={card} className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hardTotals.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bg-black/20 text-white text-sm font-semibold p-2 border border-white/10 text-center">
                        {row.total}
                      </td>
                      {row.actions.map((action, actionIdx) => (
                        <td key={actionIdx} className="p-1 border border-white/10">
                          <div className={cn('w-full h-8 rounded flex items-center justify-center font-bold text-sm', getActionColor(action))}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Soft Totals */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Soft Totals</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">Your Hand</th>
                    {dealerCards.map(card => (
                      <th key={card} className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {softTotals.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bg-black/20 text-white text-sm font-semibold p-2 border border-white/10 text-center">
                        {row.total}
                      </td>
                      {row.actions.map((action, actionIdx) => (
                        <td key={actionIdx} className="p-1 border border-white/10">
                          <div className={cn('w-full h-8 rounded flex items-center justify-center font-bold text-sm', getActionColor(action))}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pair Splits */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Pair Splits</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">Your Pair</th>
                    {dealerCards.map(card => (
                      <th key={card} className="bg-black/40 text-white text-sm font-semibold p-2 border border-white/10">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pairSplits.map((row, idx) => (
                    <tr key={idx}>
                      <td className="bg-black/20 text-white text-sm font-semibold p-2 border border-white/10 text-center">
                        {row.total}
                      </td>
                      {row.actions.map((action, actionIdx) => (
                        <td key={actionIdx} className="p-1 border border-white/10">
                          <div className={cn('w-full h-8 rounded flex items-center justify-center font-bold text-sm', getActionColor(action))}>
                            {action}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Note:</strong> This chart assumes standard rules (dealer stands on soft 17, double after split allowed).
              Adjust your strategy if your game has different rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
