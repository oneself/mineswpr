import React from 'react';
import { Difficulty, DIFFICULTY_CONFIG } from '../types/minesweeper';
import { GameSettings } from '../types/game';

interface StartPageProps {
  onStart: (settings: GameSettings) => void;
}

export const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('easy');

  const handleStart = () => {
    onStart({ difficulty: selectedDifficulty });
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
              <option value="easy">
                Easy ({DIFFICULTY_CONFIG.easy.rows}x{DIFFICULTY_CONFIG.easy.cols}, {DIFFICULTY_CONFIG.easy.mines} mines)
              </option>
              <option value="medium">
                Medium ({DIFFICULTY_CONFIG.medium.rows}x{DIFFICULTY_CONFIG.medium.cols}, {DIFFICULTY_CONFIG.medium.mines} mines)
              </option>
              <option value="hard">
                Hard ({DIFFICULTY_CONFIG.hard.rows}x{DIFFICULTY_CONFIG.hard.cols}, {DIFFICULTY_CONFIG.hard.mines} mines)
              </option>
            </select>
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