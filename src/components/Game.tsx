import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types/game';
import { Minesweeper } from './Minesweeper';
import { IntroOverlay } from './IntroOverlay';
import { loggers, stringifyForLog } from '../utils/logger';

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
  
  loggers.game('Calculating board size for viewport %dx%d', viewportWidth, viewportHeight);
  
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
    loggers.game('Using small mobile constraints');
  } else if (viewportWidth < 768) {
    constraints = sizeConstraints.largeMobile;
    loggers.game('Using large mobile constraints');
  } else if (viewportWidth < 1024) {
    constraints = sizeConstraints.tablet;
    loggers.game('Using tablet constraints');
  } else {
    constraints = sizeConstraints.desktop;
    loggers.game('Using desktop constraints');
  }

  // Calculate mines (approximately 5% of cells)
  const totalCells = constraints.rows * constraints.cols;
  const mines = Math.floor(totalCells * 0.05);

  const config = {
    rows: constraints.rows,
    cols: constraints.cols,
    mines
  };

  loggers.game('Generated board config: %s', stringifyForLog(config));
  return config;
};

/**
 * The main Game component that manages the game state and handles the responsive board size.
 * It automatically adjusts the board size when the window is resized and shows an intro
 * overlay for first-time players.
 */
export const Game: React.FC = () => {
  loggers.game('Game component mounted');
  
  // Track whether to show the intro overlay
  const [showIntro, setShowIntro] = useState(true);
  
  // Initialize game settings with a board size calculated from viewport dimensions
  const [settings, setSettings] = useState<GameSettings>(() => {
    loggers.game('Initializing game settings');
    return { config: calculateBoardSize() };
  });

  // Recalculate board size whenever the window is resized
  useEffect(() => {
    loggers.game('Setting up resize handler');
    
    // Force an immediate recalculation
    setSettings({
      config: calculateBoardSize()
    });

    const handleResize = () => {
      loggers.game('Window resized');
      setSettings({
        config: calculateBoardSize()
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      loggers.game('Cleaning up resize handler');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <Minesweeper 
        initialConfig={settings.config}
        key={`${settings.config.rows}-${settings.config.cols}`}
      />
      {showIntro && <IntroOverlay onStart={() => {
        loggers.game('Starting game, hiding intro overlay');
        setShowIntro(false);
      }} />}
    </div>
  );
}; 