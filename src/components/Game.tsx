import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types/game';
import { Minesweeper } from './Minesweeper';

const calculateBoardSize = () => {
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate cell size based on the Cell component's width (w-8 = 2rem = 32px)
  const cellSize = 32;
  const headerHeight = 150; // Space for header elements
  
  // Detect if we're on a mobile device (viewport width less than 768px)
  const isMobile = viewportWidth < 768;
  
  // Calculate maximum number of cells that can fit
  const maxCols = Math.floor(viewportWidth / cellSize) - (isMobile ? 3 : 5); // Remove fewer columns on mobile
  const maxRows = Math.floor((viewportHeight - headerHeight) / cellSize) + 1;
  
  // Ensure minimum size but don't limit maximum width
  const cols = Math.max(maxCols, 8);
  const rows = Math.max(maxRows, 8); // Only keep minimum row limit
  
  // Calculate mines (approximately 15% of cells)
  const totalCells = rows * cols;
  const mines = Math.floor(totalCells * 0.15);
  
  return { rows, cols, mines };
};

export const Game: React.FC = () => {
  const [settings, setSettings] = useState<GameSettings>(() => ({
    difficulty: 'custom',
    config: calculateBoardSize()
  }));

  // Recalculate board size on window resize
  useEffect(() => {
    const handleResize = () => {
      setSettings({
        difficulty: 'custom',
        config: calculateBoardSize()
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Minesweeper 
        initialDifficulty={settings.difficulty}
        initialConfig={settings.config}
      />
    </div>
  );
}; 