import React, { useState, useCallback, useRef } from 'react';
import { Cell as CellType } from '../types/minesweeper';
import { loggers } from '../utils/logger';

/**
 * Props for the Cell component
 */
interface CellProps {
  /** The cell data containing state and position information */
  cell: CellType;
  /** Callback function to handle revealing a cell */
  onReveal: () => void;
  /** Callback function to handle flagging a cell */
  onFlag: () => void;
}

/**
 * A single cell in the Minesweeper game board.
 * Handles both mouse and touch interactions with different behaviors:
 * - On desktop: Left click to flag, Right click to reveal
 * - On mobile: Tap to flag, Long press to reveal
 */
export const Cell: React.FC<CellProps> = ({ cell, onReveal, onFlag }) => {
  // Track if the cell is being long-pressed
  const [isLongPress, setIsLongPress] = useState(false);
  
  // References for handling touch interactions
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  /**
   * Triggers device vibration if available.
   * Used as haptic feedback for long press on mobile devices.
   */
  const vibrate = useCallback(() => {
    if (navigator.vibrate) {
      loggers.cell('Triggering vibration for cell [%d,%d]', cell.row, cell.col);
      navigator.vibrate(50);
    }
  }, [cell.row, cell.col]);

  /**
   * Handles the start of a touch interaction.
   * Initiates a timer for detecting long press.
   * 
   * @param e - The touch event
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    loggers.cell('Touch start on cell [%d,%d]', cell.row, cell.col);
    touchStartTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      loggers.cell('Long press detected on cell [%d,%d]', cell.row, cell.col);
      setIsLongPress(true);
      onReveal();
      vibrate();
    }, 500); // Increased to 500ms for more reliable long press detection
  }, [onReveal, vibrate, cell.row, cell.col]);

  /**
   * Handles the end of a touch interaction.
   * If it was a short tap (< 500ms), flags the cell.
   * 
   * @param e - The touch event
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    const touchDuration = Date.now() - touchStartTimeRef.current;
    loggers.cell('Touch end on cell [%d,%d], duration: %dms', cell.row, cell.col, touchDuration);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only trigger flag if it was a short tap (less than 500ms)
    if (touchDuration < 500 && !isLongPress) {
      loggers.cell('Short tap detected on cell [%d,%d], flagging', cell.row, cell.col);
      onFlag();
    }

    setIsLongPress(false);
  }, [isLongPress, onFlag, cell.row, cell.col]);

  /**
   * Handles cancellation of a touch interaction.
   * Cleans up the long press timer.
   * 
   * @param e - The touch event
   */
  const handleTouchCancel = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    loggers.cell('Touch cancelled on cell [%d,%d]', cell.row, cell.col);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLongPress(false);
  }, [cell.row, cell.col]);

  /**
   * Handles touch movement during interaction.
   * Cancels long press if the user moves their finger.
   * 
   * @param e - The touch event
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    loggers.cell('Touch move detected on cell [%d,%d], cancelling long press', cell.row, cell.col);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLongPress(false);
  }, [cell.row, cell.col]);

  /**
   * Handles right-click on desktop devices.
   * Reveals the cell instead of showing context menu.
   * 
   * @param e - The mouse event
   */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu
    loggers.cell('Right click on cell [%d,%d], revealing', cell.row, cell.col);
    onReveal();
  }, [onReveal, cell.row, cell.col]);

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
          loggers.cell('Left click on cell [%d,%d], flagging', cell.row, cell.col);
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
} 