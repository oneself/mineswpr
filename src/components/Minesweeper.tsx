import React, { useState, useCallback } from 'react';
import { GameState, GameConfig } from '../types/minesweeper';
import { createBoard, revealCell, checkWin, autoRevealSafeCells } from '../utils/gameUtils';
import { Cell } from './Cell';
import { Modal } from './Modal';

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
  // Initialize game state with a new board
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      board: createBoard(initialConfig),
      gameOver: false,
      gameWon: false,
      mineCount: initialConfig.mines,
      flagCount: 0,
    };
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
    if (gameState.gameOver || gameState.gameWon) return;

    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      // Don't reveal flagged cells
      if (cell.isFlagged) return prev;

      // Game over if mine is clicked
      if (cell.isMine) {
        cell.isRevealed = true;
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }

      // Reveal the clicked cell and its neighbors
      const hitMine = revealCell(newBoard, row, col);
      if (hitMine) {
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }
      
      // Auto-reveal safe cells
      const { hitMine: autoRevealHitMine } = autoRevealSafeCells(newBoard);
      if (autoRevealHitMine) {
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }
      
      // Check if the game is won
      const won = checkWin(newBoard);
      if (won) {
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
    if (gameState.gameOver || gameState.gameWon) return;

    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (!cell.isRevealed) {
        // Toggle flag state
        cell.isFlagged = !cell.isFlagged;
        const newFlagCount = prev.flagCount + (cell.isFlagged ? 1 : -1);
        
        // Auto-reveal safe cells after flagging
        const { hitMine } = autoRevealSafeCells(newBoard);
        if (hitMine) {
          setShowModal(true);
          return { ...prev, board: newBoard, gameOver: true };
        }
        
        // Check if the game is won
        const won = checkWin(newBoard);
        if (won) {
          setShowModal(true);
        }
        
        return {
          ...prev,
          board: newBoard,
          flagCount: newFlagCount,
          gameWon: won,
        };
      }
      return prev;
    });
  }, [gameState.gameOver, gameState.gameWon]);

  /**
   * Resets the game to its initial state with a new board.
   */
  const resetGame = useCallback(() => {
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

      <Modal
        isOpen={showModal}
        title={gameState.gameWon ? "Congratulations!" : "Game Over"}
        message={gameState.gameWon ? "You've won! 🎉" : "You hit a mine! 💥"}
        onClose={() => setShowModal(false)}
        onRestart={resetGame}
      />
    </div>
  );
} 