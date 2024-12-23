import React, { useState, useCallback, useRef } from 'react';
import { Cell as CellType } from '../types/minesweeper';

interface CellProps {
  cell: CellType;
  onReveal: () => void;
  onFlag: () => void;
}

export const Cell: React.FC<CellProps> = ({ cell, onReveal, onFlag }) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      onFlag();
    }, 300);
  }, [onFlag]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isLongPress) {
      onReveal();
    }
    setIsLongPress(false);
  }, [isLongPress, onReveal]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsLongPress(false);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
    onFlag();
  }, [onFlag]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onContextMenu={handleContextMenu}
      onClick={onReveal}
      className={`
        w-8 h-8 flex items-center justify-center select-none touch-none
        ${cell.isRevealed
          ? 'bg-gray-200'
          : 'bg-gray-400 hover:bg-gray-500'}
        ${cell.isMine && cell.isRevealed ? 'bg-red-500' : ''}
        font-bold text-sm
      `}
    >
      {cell.isRevealed
        ? cell.isMine
          ? '💣'
          : cell.neighborMines || ''
        : cell.isFlagged
          ? '🚩'
          : ''}
    </button>
  );
}; 