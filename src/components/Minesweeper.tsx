import React, { useState, useCallback } from 'react';
import { GameState, GameConfig } from '../types/minesweeper';
import { createBoard, revealCell, checkWin, autoRevealSafeCells } from '../utils/gameUtils';
import { Cell } from './Cell';
import { Modal } from './Modal';
import { loggers, stringifyForLog } from '../utils/logger';

/**
 * Props for the Minesweeper component
 */
interface MinesweeperProps {
  /** Initial configuration for the game board */
  initialConfig: GameConfig;
}

/**
 * The main Minesweeper game component that handles the game logic and renders the board.
 * It manages the game state, handles cell interactions, and determines win/lose conditions.
 */
export const Minesweeper: React.FC<MinesweeperProps> = ({ 
  initialConfig,
}) => {
  loggers.board('Initializing Minesweeper with config: %s', stringifyForLog(initialConfig));
  
  // Initialize game state with a new board
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = {
      board: createBoard(initialConfig),
      gameOver: false,
      gameWon: false,
      mineCount: initialConfig.mines,
      flagCount: 0,
    };
    loggers.board('Initial game state created: %s', stringifyForLog({
      ...initialState,
      board: `${initialState.board.length}x${initialState.board[0].length} board`
    }));
    return initialState;
  });
  
  // Control visibility of the win/lose modal
  const [showModal, setShowModal] = useState(false);

  /**
   * Handles revealing a cell when clicked.
   * If the cell contains a mine, the game ends.
   * If the cell is safe, it reveals adjacent cells with no neighboring mines.
   * 
   * @param row - The row index of the clicked cell
   * @param col - The column index of the clicked cell
   */
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || gameState.gameWon) {
      loggers.board('Click ignored - game already %s', gameState.gameWon ? 'won' : 'over');
      return;
    }

    loggers.board('Cell clicked at [%d,%d]', row, col);
    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (cell.isFlagged) {
        loggers.board('Click ignored - cell [%d,%d] is flagged', row, col);
        return prev;
      }

      if (cell.isMine) {
        loggers.board('Mine hit at [%d,%d] - game over', row, col);
        cell.isRevealed = true;
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }

      loggers.board('Revealing cell at [%d,%d]', row, col);
      const hitMine = revealCell(newBoard, row, col);
      if (hitMine) {
        loggers.board('Mine hit during reveal - game over');
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }
      
      loggers.board('Auto-revealing safe cells');
      const { hitMine: autoRevealHitMine } = autoRevealSafeCells(newBoard);
      if (autoRevealHitMine) {
        loggers.board('Mine hit during auto-reveal - game over');
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }
      
      const won = checkWin(newBoard);
      if (won) {
        loggers.board('Game won!');
        setShowModal(true);
      }

      return {
        ...prev,
        board: newBoard,
        gameWon: won,
      };
    });
  }, [gameState.gameOver, gameState.gameWon]);

  /**
   * Handles flagging/unflagging a cell with right click.
   * Flagged cells cannot be revealed until unflagged.
   * 
   * @param row - The row index of the right-clicked cell
   * @param col - The column index of the right-clicked cell
   */
  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || gameState.gameWon) {
      loggers.board('Flag ignored - game already %s', gameState.gameWon ? 'won' : 'over');
      return;
    }

    loggers.board('Cell flagged at [%d,%d]', row, col);
    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (cell.isRevealed) {
        loggers.board('Flag ignored - cell [%d,%d] already revealed', row, col);
        return prev;
      }

      cell.isFlagged = !cell.isFlagged;
      const newFlagCount = prev.flagCount + (cell.isFlagged ? 1 : -1);
      loggers.board('Flag count updated: %d/%d', newFlagCount, prev.mineCount);

      // Auto-reveal safe cells after flagging
      if (cell.isFlagged) {
        loggers.board('Attempting auto-reveal after flagging cell [%d,%d]', row, col);
        const { hitMine } = autoRevealSafeCells(newBoard);
        if (hitMine) {
          loggers.board('Mine hit during auto-reveal - game over');
          setShowModal(true);
          return {
            ...prev,
            board: newBoard,
            flagCount: newFlagCount,
            gameOver: true
          };
        }
      }

      // Check if the game is won after flagging
      const won = checkWin(newBoard);
      if (won) {
        loggers.board('Game won after flagging!');
        setShowModal(true);
      }

      return {
        ...prev,
        board: newBoard,
        flagCount: newFlagCount,
        gameWon: won
      };
    });
  }, [gameState.gameOver, gameState.gameWon]);

  /**
   * Resets the game to its initial state with a new board.
   */
  const handleRestart = useCallback(() => {
    loggers.board('Restarting game with config: %s', stringifyForLog(initialConfig));
    setGameState({
      board: createBoard(initialConfig),
      gameOver: false,
      gameWon: false,
      mineCount: initialConfig.mines,
      flagCount: 0,
    });
    setShowModal(false);
  }, [initialConfig]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-2">
      <div className="grid gap-1 bg-gray-300 p-2 rounded">
        {gameState.board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onReveal={() => handleCellClick(rowIndex, colIndex)}
                onFlag={() => handleCellRightClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          isOpen={true}
          title={gameState.gameWon ? "Congratulations!" : "Game Over"}
          message={gameState.gameWon ? "You've won! 🎉" : "You hit a mine! 💥"}
          onClose={() => setShowModal(false)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
} 