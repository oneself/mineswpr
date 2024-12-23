import React, { useState, useEffect } from 'react';
import { Difficulty, DIFFICULTY_CONFIG, GameConfig } from '../types/minesweeper';
import { GameSettings } from '../types/game';

interface StartPageProps {
  onStart: (settings: GameSettings) => void;
}

export const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [customConfig, setCustomConfig] = useState<GameConfig>({
    rows: DIFFICULTY_CONFIG.easy.rows,
    cols: DIFFICULTY_CONFIG.easy.cols,
    mines: DIFFICULTY_CONFIG.easy.mines,
  });

  // Update custom config when difficulty changes
  useEffect(() => {
    if (selectedDifficulty !== 'custom') {
      setCustomConfig(DIFFICULTY_CONFIG[selectedDifficulty]);
    }
  }, [selectedDifficulty]);

  // Check if current config matches any preset
  const updateDifficultyFromConfig = (config: GameConfig) => {
    const matchingDifficulty = (Object.entries(DIFFICULTY_CONFIG) as [Difficulty, GameConfig][])
      .find(([key, preset]) => 
        key !== 'custom' && 
        preset.rows === config.rows && 
        preset.cols === config.cols && 
        preset.mines === config.mines
      );

    setSelectedDifficulty(matchingDifficulty ? matchingDifficulty[0] : 'custom');
  };

  const handleConfigChange = (field: keyof GameConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    const newConfig = { ...customConfig, [field]: numValue };
    
    // Ensure mines don't exceed available cells
    if (field === 'mines') {
      newConfig.mines = Math.min(numValue, (newConfig.rows * newConfig.cols) - 1);
    } else {
      newConfig.mines = Math.min(newConfig.mines, (newConfig.rows * newConfig.cols) - 1);
    }

    setCustomConfig(newConfig);
    updateDifficultyFromConfig(newConfig);
  };

  const handleStart = () => {
    const config = selectedDifficulty === 'custom' ? customConfig : DIFFICULTY_CONFIG[selectedDifficulty];
    onStart({ difficulty: selectedDifficulty, config });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Minesweeper</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy (9x9, 10 mines)</option>
              <option value="medium">Medium (16x16, 40 mines)</option>
              <option value="hard">Hard (16x30, 99 mines)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className={`space-y-4 ${selectedDifficulty === 'custom' ? 'opacity-100' : 'opacity-50'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Width
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customConfig.cols}
                  onChange={(e) => handleConfigChange('cols', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedDifficulty !== 'custom'}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Height
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customConfig.rows}
                  onChange={(e) => handleConfigChange('rows', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedDifficulty !== 'custom'}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mines
              </label>
              <input
                type="number"
                min="1"
                max={(customConfig.rows * customConfig.cols) - 1}
                value={customConfig.mines}
                onChange={(e) => handleConfigChange('mines', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={selectedDifficulty !== 'custom'}
              />
              <p className="text-sm text-gray-500 mt-1">
                Max: {(customConfig.rows * customConfig.cols) - 1} mines
              </p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Start Game
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <h2 className="font-bold mb-2">How to Play:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Left-click to reveal a cell</li>
            <li>Right-click to flag a potential mine</li>
            <li>Numbers show adjacent mines</li>
            <li>Flag all mines and reveal all safe cells to win</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 