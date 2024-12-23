import React, { useState } from 'react';
import { GamePage, GameSettings } from '../types/game';
import { StartPage } from './StartPage';
import { Minesweeper } from './Minesweeper';

export const Game: React.FC = () => {
  const [page, setPage] = useState<GamePage>('start');
  const [settings, setSettings] = useState<GameSettings>({ 
    difficulty: 'easy',
    config: {
      rows: 9,
      cols: 9,
      mines: 10
    }
  });

  const handleStart = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setPage('game');
  };

  const handleBackToStart = () => {
    setPage('start');
  };

  return (
    <div>
      {page === 'start' && <StartPage onStart={handleStart} />}
      {page === 'game' && (
        <Minesweeper 
          initialDifficulty={settings.difficulty}
          initialConfig={settings.config}
          onBackToStart={handleBackToStart}
        />
      )}
    </div>
  );
}; 