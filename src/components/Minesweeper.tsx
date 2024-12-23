import React, { useState, useCallback } from 'react';
import { GameState, DIFFICULTY_CONFIG, Difficulty } from '../types/minesweeper';
import { createBoard, revealCell, checkWin, autoRevealSafeCells } from '../utils/gameUtils';
import { Cell } from './Cell';
import { Modal } from './Modal';

interface MinesweeperProps {
  initialDifficulty: Difficulty;
  onBackToStart: () => void;
}

export const Minesweeper: React.FC<MinesweeperProps> = ({ 
  initialDifficulty,
  onBackToStart,
}) => {
  const [difficulty] = useState<Difficulty>(initialDifficulty);
  const [gameState, setGameState] = useState<GameState>(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    return {
      board: createBoard(config),
      gameOver: false,
      gameWon: false,
      mineCount: config.mines,
      flagCount: 0,
    };
  });
  const [showModal, setShowModal] = useState(false);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || gameState.gameWon) return;

    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (cell.isFlagged) return prev;

      if (cell.isMine) {
        cell.isRevealed = true;
        setShowModal(true);
        return { ...prev, board: newBoard, gameOver: true };
      }

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

  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (gameState.gameOver || gameState.gameWon) return;

    setGameState(prev => {
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
        const newFlagCount = prev.flagCount + (cell.isFlagged ? 1 : -1);
        
        // Auto-reveal safe cells after flagging
        const { hitMine } = autoRevealSafeCells(newBoard);
        if (hitMine) {
          setShowModal(true);
          return { ...prev, board: newBoard, gameOver: true };
        }
        
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

  const resetGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setGameState({
      board: createBoard(config),
      gameOver: false,
      gameWon: false,
      mineCount: config.mines,
      flagCount: 0,
    });
    setShowModal(false);
  }, [difficulty]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="mb-4 space-x-2 flex items-center">
        <button
          onClick={onBackToStart}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset
        </button>
      </div>

      <div className="mb-4">
        <span className="text-lg font-bold">
          Mines: {gameState.mineCount - gameState.flagCount}
        </span>
      </div>

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
        onBackToStart={onBackToStart}
      />
    </div>
  );
}; 