import debug from 'debug';

// Always enable debug logging
localStorage.setItem('debug', 'minesweeper:*');
console.log('Minesweeper logging enabled. You should see logs prefixed with "minesweeper:"');

// Create namespaced loggers
export const loggers = {
  game: debug('minesweeper:game'),
  board: debug('minesweeper:board'),
  utils: debug('minesweeper:utils'),
  cell: debug('minesweeper:cell'),
};

// Helper function to stringify objects for logging
export const stringifyForLog = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Circular or Invalid Object]: ${String(obj)}`;
  }
}; 