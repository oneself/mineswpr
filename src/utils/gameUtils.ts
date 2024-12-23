import { Cell, GameConfig } from '../types/minesweeper';

export const createBoard = (config: GameConfig): Cell[][] => {
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
  const { rows, cols, mines } = config;
  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
      updateNeighborCounts(board, row, col);
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
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < board.length && 
        newCol >= 0 && newCol < board[0].length) {
      neighbors.push(board[newRow][newCol]);
    }
  });

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
  
  if (cell.isRevealed || cell.isFlagged) return false;
  
  cell.isRevealed = true;

  // If it's a mine, return true to indicate mine hit
  if (cell.isMine) return true;

  // If it's a cell with no adjacent mines, reveal all neighbors
  if (cell.neighborMines === 0) {
    const neighbors = getNeighbors(board, row, col);
    for (const neighbor of neighbors) {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        if (revealCell(board, neighbor.row, neighbor.col)) {
          return true; // Propagate mine hit
        }
      }
    }
  }

  return false; // No mine hit
};

export const autoRevealSafeCells = (board: Cell[][]): { hitMine: boolean } => {
  let safeCells = findSafeCellsToReveal(board);
  
  while (safeCells.length > 0) {
    for (const cell of safeCells) {
      if (!cell.isRevealed && !cell.isFlagged) {
        if (revealCell(board, cell.row, cell.col)) {
          return { hitMine: true };
        }
      }
    }
    
    // Look for more safe cells that might have been revealed
    safeCells = findSafeCellsToReveal(board);
  }
  
  return { hitMine: false };
};

export const checkWin = (board: Cell[][]): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}; 