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
  const touchStartTimeRef = useRef<number>(0);

  // Function to trigger vibration
  const vibrate = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    touchStartTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      onReveal();
      vibrate();
    }, 500); // Increased to 500ms for more reliable long press detection
  }, [onReveal, vibrate]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    const touchDuration = Date.now() - touchStartTimeRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only trigger flag if it was a short tap (less than 500ms)
    if (touchDuration < 500 && !isLongPress) {
      onFlag();
    }

    setIsLongPress(false);
  }, [isLongPress, onFlag]);

  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLongPress(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsLongPress(false);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
    onReveal();
  }, [onReveal]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onTouchMove={handleTouchMove}
      onContextMenu={handleContextMenu}
      onClick={(e) => {
        // Only handle click for non-touch devices
        if (!('ontouchstart' in window)) {
          onFlag();
        }
      }}
      className={`
        w-8 h-8 flex items-center justify-center select-none touch-none
        ${cell.isRevealed
          ? 'bg-gray-200'
          : 'bg-gray-400 active:bg-gray-500'}
        ${cell.isMine && cell.isRevealed ? 'bg-red-500' : ''}
        ${isLongPress ? 'bg-gray-600' : ''}
        font-bold text-sm rounded-sm
        transition-colors duration-150
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