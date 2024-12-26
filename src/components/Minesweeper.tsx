import React, { useState, useCallback } from 'react';
import { GameState, GameConfig } from '../types/minesweeper';
import { createBoard, revealCell, checkWin, autoRevealSafeCells } from '../utils/gameUtils';
import { Cell } from './Cell';
import { Modal } from './Modal';

interface MinesweeperProps {
  initialConfig: GameConfig;
}

export const Minesweeper: React.FC<MinesweeperProps> = ({ 
  initialConfig,
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      board: createBoard(initialConfig),
      gameOver: false,
      gameWon: false,
      mineCount: initialConfig.mines,
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