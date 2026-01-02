import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { CountingSystemName } from '../types/game';
import { cn } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SettingsPanelProps {
  className?: string;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ className, onClose }) => {
  const { rules, settings, updateRules, updateSettings } = useGameStore();
  const [localRules, setLocalRules] = useState(rules);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateRules(localRules);
    updateSettings(localSettings);
    onClose?.();
  };

  return (
    <div className={cn('bg-black/60 backdrop-blur-sm rounded-lg p-6 space-y-6 max-w-2xl', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Game Settings</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
            ✕
          </Button>
        )}
      </div>

      {/* Display Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Display Options</h3>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="show-count" className="text-white cursor-pointer">
            Show Card Count
          </Label>
          <input
            type="checkbox"
            id="show-count"
            checked={localSettings.showCount}
            onChange={(e) => setLocalSettings({ ...localSettings, showCount: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="show-hints" className="text-white cursor-pointer">
            Show Strategy Hints
          </Label>
          <input
            type="checkbox"
            id="show-hints"
            checked={localSettings.showStrategyHints}
            onChange={(e) => setLocalSettings({ ...localSettings, showStrategyHints: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="bg-white/5 rounded p-3">
          <Label htmlFor="counting-system" className="text-white mb-2 block">
            Counting System
          </Label>
          <Select
            value={localSettings.countingSystem}
            onValueChange={(value) => setLocalSettings({ ...localSettings, countingSystem: value as CountingSystemName })}
          >
            <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hi-Lo">Hi-Lo (Beginner)</SelectItem>
              <SelectItem value="KO">KO / Knock-Out</SelectItem>
              <SelectItem value="Omega II">Omega II (Advanced)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Game Rules</h3>

        <div className="bg-white/5 rounded p-3">
          <Label htmlFor="num-decks" className="text-white mb-2 block">
            Number of Decks: {localRules.numDecks}
          </Label>
          <input
            type="range"
            id="num-decks"
            min="1"
            max="8"
            value={localRules.numDecks}
            onChange={(e) => setLocalRules({ ...localRules, numDecks: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="bg-white/5 rounded p-3">
          <Label htmlFor="penetration" className="text-white mb-2 block">
            Deck Penetration: {(localRules.penetration * 100).toFixed(0)}%
          </Label>
          <input
            type="range"
            id="penetration"
            min="0.5"
            max="0.95"
            step="0.05"
            value={localRules.penetration}
            onChange={(e) => setLocalRules({ ...localRules, penetration: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="dealer-h17" className="text-white cursor-pointer">
            Dealer Hits on Soft 17 (H17)
          </Label>
          <input
            type="checkbox"
            id="dealer-h17"
            checked={localRules.dealerHitsOn17}
            onChange={(e) => setLocalRules({ ...localRules, dealerHitsOn17: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="das" className="text-white cursor-pointer">
            Double After Split (DAS)
          </Label>
          <input
            type="checkbox"
            id="das"
            checked={localRules.canDoubleAfterSplit}
            onChange={(e) => setLocalRules({ ...localRules, canDoubleAfterSplit: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="late-surrender" className="text-white cursor-pointer">
            Late Surrender
          </Label>
          <input
            type="checkbox"
            id="late-surrender"
            checked={localRules.canSurrenderLate}
            onChange={(e) => setLocalRules({ ...localRules, canSurrenderLate: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded p-3">
          <Label htmlFor="can-resplit" className="text-white cursor-pointer">
            Allow Resplitting
          </Label>
          <input
            type="checkbox"
            id="can-resplit"
            checked={localRules.canResplit}
            onChange={(e) => setLocalRules({ ...localRules, canResplit: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="bg-white/5 rounded p-3">
          <Label htmlFor="max-split-hands" className="text-white mb-2 block">
            Max Split Hands: {localRules.maxSplitHands}
          </Label>
          <input
            type="range"
            id="max-split-hands"
            min="2"
            max="4"
            value={localRules.maxSplitHands}
            onChange={(e) => setLocalRules({ ...localRules, maxSplitHands: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-white/60 text-xs mt-1">
            Number of hands you can create by splitting (2-4)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Save & Apply
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
