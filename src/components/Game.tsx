import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types/game';
import { Minesweeper } from './Minesweeper';
import { IntroOverlay } from './IntroOverlay';

/**
 * Calculates the optimal board size and number of mines based on the viewport dimensions.
 * The calculation ensures the board fits well on both mobile and desktop screens.
 * 
 * @returns {GameConfig} Configuration object with rows, columns, and number of mines
 */
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
  
  // Calculate mines (approximately 5% of cells)
  const totalCells = rows * cols;
  const mines = Math.floor(totalCells * 0.05);
  
  return { rows, cols, mines };
};

/**
 * The main Game component that manages the game state and handles the responsive board size.
 * It automatically adjusts the board size when the window is resized and shows an intro
 * overlay for first-time players.
 */
export const Game: React.FC = () => {
  // Track whether to show the intro overlay
  const [showIntro, setShowIntro] = useState(true);
  
  // Initialize game settings with a board size calculated from viewport dimensions
  const [settings, setSettings] = useState<GameSettings>(() => ({
    config: calculateBoardSize()
  }));

  // Recalculate board size whenever the window is resized
  useEffect(() => {
    const handleResize = () => {
      setSettings({
        config: calculateBoardSize()
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Minesweeper 
        initialConfig={settings.config}
      />
      {showIntro && <IntroOverlay onStart={() => setShowIntro(false)} />}
    </div>
  );
}; 