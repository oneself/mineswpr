import React, { useState, useCallback } from 'react';
import { Cell as CellType } from '../types/minesweeper';

interface CellProps {
  cell: CellType;
  onReveal: () => void;
  onFlag: () => void;
}

export const Cell: React.FC<CellProps> = ({ cell, onReveal, onFlag }) => {
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  const handleTouchStart = useCallback(() => {
    setTouchStartTime(Date.now());
    const timeout = setTimeout(() => {
      onFlag();
    }, 500);
    setTouchTimeout(timeout);
  }, [onFlag]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
    
    if (Date.now() - touchStartTime < 500) {
      onReveal();
    }
  }, [touchTimeout, touchStartTime, onReveal]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onReveal}
      onContextMenu={(e) => {
        e.preventDefault();
        onFlag();
      }}
      className={`
        w-8 h-8 flex items-center justify-center
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