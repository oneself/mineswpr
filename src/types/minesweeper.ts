export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface GameState {
  board: Cell[][];
  gameOver: boolean;
  gameWon: boolean;
  mineCount: number;
  flagCount: number;
}

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
} 