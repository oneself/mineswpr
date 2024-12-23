import { Difficulty } from './minesweeper';

export interface GameSettings {
  difficulty: Difficulty;
}

export type GamePage = 'start' | 'game'; 