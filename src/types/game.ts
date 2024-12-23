import { Difficulty, GameConfig } from './minesweeper';

export interface GameSettings {
  difficulty: Difficulty;
  config: GameConfig;
}

export type GamePage = 'start' | 'game'; 