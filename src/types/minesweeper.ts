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

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
}; 