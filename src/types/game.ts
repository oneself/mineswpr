import { GameConfig } from './minesweeper';

export interface GameSettings {
  config: GameConfig;
}

export type GamePage = 'start' | 'game'; 