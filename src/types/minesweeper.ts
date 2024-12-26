/**
 * Represents a single cell in the Minesweeper game board.
 */
export interface Cell {
  /** Zero-based row index of the cell */
  row: number;
  /** Zero-based column index of the cell */
  col: number;
  /** Whether this cell contains a mine */
  isMine: boolean;
  /** Whether this cell has been revealed by the player */
  isRevealed: boolean;
  /** Whether this cell has been flagged as a potential mine */
  isFlagged: boolean;
  /** Number of adjacent cells that contain mines (0-8) */
  neighborMines: number;
}

/**
 * Represents the current state of the Minesweeper game.
 */
export interface GameState {
  /** 2D array representing the game board */
  board: Cell[][];
  /** Whether the game has ended due to hitting a mine */
  gameOver: boolean;
  /** Whether the player has won by revealing all non-mine cells */
  gameWon: boolean;
  /** Total number of mines on the board */
  mineCount: number;
  /** Number of flags currently placed by the player */
  flagCount: number;
}

/**
 * Configuration for creating a new Minesweeper game board.
 */
export interface GameConfig {
  /** Number of rows in the game board */
  rows: number;
  /** Number of columns in the game board */
  cols: number;
  /** Number of mines to place on the board */
  mines: number;
} 