import { Cell, GameConfig } from '../types/minesweeper';
import { loggers, stringifyForLog } from './logger';

export const createBoard = (config: GameConfig): Cell[][] => {
  loggers.utils('Creating board with config: %s', stringifyForLog(config));
  
  const { rows, cols } = config;
  const board: Cell[][] = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      board[i][j] = {
        row: i,
        col: j,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      };
    }
  }

  return placeMines(board, config);
};

const placeMines = (board: Cell[][], config: GameConfig): Cell[][] => {
  loggers.utils('Placing %d mines on board', config.mines);
  
  const { rows, cols, mines } = config;
  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
      updateNeighborCounts(board, row, col);
      loggers.utils('Placed mine at [%d,%d], %d mines remaining', row, col, mines - minesPlaced);
    }
  }

  return board;
};

const updateNeighborCounts = (board: Cell[][], row: number, col: number): void => {
  const neighbors = getNeighbors(board, row, col);
  neighbors.forEach(cell => {
    if (!cell.isMine) {
      cell.neighborMines++;
    }
  });
};

export const getNeighbors = (board: Cell[][], row: number, col: number): Cell[] => {
  const neighbors: Cell[] = [];
  const maxRow = board.length - 1;
  const maxCol = board[0].length - 1;

  for (let r = Math.max(0, row - 1); r <= Math.min(maxRow, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(maxCol, col + 1); c++) {
      if (r !== row || c !== col) {
        neighbors.push(board[r][c]);
      }
    }
  }

  return neighbors;
};

const hasCorrectFlagCount = (cell: Cell, board: Cell[][]): boolean => {
  const neighbors = getNeighbors(board, cell.row, cell.col);
  const flaggedNeighbors = neighbors.filter(n => n.isFlagged).length;
  return flaggedNeighbors === cell.neighborMines;
};

const findSafeCellsToReveal = (board: Cell[][]): Cell[] => {
  const safeCells: Cell[] = [];
  
  // First pass: Find revealed numbers with all mines flagged
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      
      if (cell.isRevealed && !cell.isMine && cell.neighborMines > 0) {
        if (hasCorrectFlagCount(cell, board)) {
          // Add unrevealed, unflagged neighbors to safe cells
          const neighbors = getNeighbors(board, row, col);
          neighbors.forEach(neighbor => {
            if (!neighbor.isRevealed && !neighbor.isFlagged && !safeCells.includes(neighbor)) {
              safeCells.push(neighbor);
            }
          });
        }
      }
    }
  }
  
  return safeCells;
};

export const revealCell = (board: Cell[][], row: number, col: number): boolean => {
  const cell = board[row][col];
  
  if (cell.isFlagged) {
    loggers.utils('Attempted to reveal flagged cell at [%d,%d]', row, col);
    return false;
  }

  if (cell.isRevealed) {
    loggers.utils('Cell at [%d,%d] already revealed', row, col);
    return false;
  }

  cell.isRevealed = true;
  
  if (cell.isMine) {
    loggers.utils('Hit mine at [%d,%d]', row, col);
    return true;
  }

  loggers.utils('Revealed safe cell at [%d,%d] with %d neighbor mines', row, col, cell.neighborMines);
  
  // If cell has no neighboring mines, reveal neighbors
  if (cell.neighborMines === 0) {
    loggers.utils('Auto-revealing neighbors of cell [%d,%d]', row, col);
    const neighbors = getNeighbors(board, row, col);
    neighbors.forEach(neighbor => {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        revealCell(board, neighbor.row, neighbor.col);
      }
    });
  }

  return false;
};

export const autoRevealSafeCells = (board: Cell[][]): { hitMine: boolean } => {
  loggers.utils('Starting auto-reveal of safe cells');
  let safeCells = findSafeCellsToReveal(board);
  
  while (safeCells.length > 0) {
    for (const cell of safeCells) {
      if (!cell.isFlagged && !cell.isRevealed) {
        if (cell.isMine) {
          loggers.utils('Auto-reveal hit mine at [%d,%d]', cell.row, cell.col);
          return { hitMine: true };
        }
        cell.isRevealed = true;
        loggers.utils('Auto-revealed safe cell at [%d,%d]', cell.row, cell.col);
      }
    }
    safeCells = findSafeCellsToReveal(board);
  }
  
  loggers.utils('Auto-reveal complete, no mines hit');
  return { hitMine: false };
};

export const checkWin = (board: Cell[][]): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (!cell.isMine && !cell.isRevealed) {
        loggers.utils('Game not won: unrevealed safe cell at [%d,%d]', row, col);
        return false;
      }
    }
  }
  
  loggers.utils('Game won! All safe cells revealed');
  return true;
}; 