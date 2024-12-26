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
  
  // Define fixed board sizes for different screen sizes
  const sizeConstraints = {
    smallMobile: {
      rows: 10,
      cols: 10,
      cellSize: 32
    },
    largeMobile: {
      rows: 14,
      cols: 14,
      cellSize: 30
    },
    tablet: {
      rows: 18,
      cols: 18,
      cellSize: 28
    },
    desktop: {
      rows: 22,
      cols: 22,
      cellSize: 26
    }
  };

  // Determine device type and get constraints
  let constraints;
  if (viewportWidth < 480) {
    constraints = sizeConstraints.smallMobile;
  } else if (viewportWidth < 768) {
    constraints = sizeConstraints.largeMobile;
  } else if (viewportWidth < 1024) {
    constraints = sizeConstraints.tablet;
  } else {
    constraints = sizeConstraints.desktop;
  }

  // Calculate mines (approximately 5% of cells)
  const totalCells = constraints.rows * constraints.cols;
  const mines = Math.floor(totalCells * 0.05);

  return {
    rows: constraints.rows,
    cols: constraints.cols,
    mines
  };
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
    // Force an immediate recalculation
    setSettings({
      config: calculateBoardSize()
    });

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
        key={`${settings.config.rows}-${settings.config.cols}`} // Force remount on size change
      />
      {showIntro && <IntroOverlay onStart={() => setShowIntro(false)} />}
    </div>
  );
}; 