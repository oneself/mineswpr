import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Cell } from '../Cell';
import { Cell as CellType } from '../../types/minesweeper';

describe('Cell', () => {
  // Mock functions for event handlers
  const mockOnReveal = jest.fn();
  const mockOnFlag = jest.fn();
  
  // Mock navigator.vibrate for mobile tests
  const mockVibrate = jest.fn();
  Object.defineProperty(navigator, 'vibrate', {
    value: mockVibrate,
    writable: true
  });

  // Base cell data for tests
  const baseCell: CellType = {
    row: 0,
    col: 0,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    neighborMines: 0
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Desktop Interactions', () => {
    beforeEach(() => {
      // Ensure we're testing desktop behavior by removing touch support
      delete (window as any).ontouchstart;
      
      // Also ensure window.matchMedia returns false for any touch query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('should flag cell on left click', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(mockOnFlag).toHaveBeenCalledTimes(1);
      expect(mockOnReveal).not.toHaveBeenCalled();
    });

    it('should reveal cell on right click', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.contextMenu(button);
      });
      
      expect(mockOnReveal).toHaveBeenCalledTimes(1);
      expect(mockOnFlag).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Interactions', () => {
    beforeEach(() => {
      // Mock touch device detection
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true
      });
      
      // Reset timers for each test
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should flag cell on short tap', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      // Simulate short tap
      await act(async () => {
        fireEvent.touchStart(button);
        jest.advanceTimersByTime(100); // Short duration
        fireEvent.touchEnd(button);
      });

      expect(mockOnFlag).toHaveBeenCalledTimes(1);
      expect(mockOnReveal).not.toHaveBeenCalled();
    });

    it('should reveal cell on long press', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      // Simulate long press
      await act(async () => {
        fireEvent.touchStart(button);
        jest.advanceTimersByTime(500); // Long press threshold
        fireEvent.touchEnd(button);
      });

      expect(mockOnReveal).toHaveBeenCalledTimes(1);
      expect(mockVibrate).toHaveBeenCalledWith(50); // Check vibration
      expect(mockOnFlag).not.toHaveBeenCalled();
    });

    it('should cancel long press on touch move', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      // Start touch and move
      await act(async () => {
        fireEvent.touchStart(button);
        fireEvent.touchMove(button);
        jest.advanceTimersByTime(500);
        fireEvent.touchEnd(button);
      });

      expect(mockOnReveal).not.toHaveBeenCalled();
      expect(mockOnFlag).not.toHaveBeenCalled();
    });

    it('should cancel long press on touch cancel', async () => {
      render(
        <Cell
          cell={baseCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = screen.getByRole('button');
      
      // Start touch and cancel
      await act(async () => {
        fireEvent.touchStart(button);
        fireEvent.touchCancel(button);
        jest.advanceTimersByTime(500);
      });

      expect(mockOnReveal).not.toHaveBeenCalled();
      expect(mockOnFlag).not.toHaveBeenCalled();
    });
  });

  describe('Cell Appearance', () => {
    it('should display mine when revealed and contains mine', () => {
      const mineCell = { ...baseCell, isMine: true, isRevealed: true };
      render(
        <Cell
          cell={mineCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      expect(screen.getByText('💣')).toBeInTheDocument();
    });

    it('should display flag when flagged', () => {
      const flaggedCell = { ...baseCell, isFlagged: true };
      render(
        <Cell
          cell={flaggedCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      expect(screen.getByText('🚩')).toBeInTheDocument();
    });

    it('should display neighbor mine count when revealed', () => {
      const revealedCell = { ...baseCell, isRevealed: true, neighborMines: 3 };
      render(
        <Cell
          cell={revealedCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should have correct background color when revealed', () => {
      const revealedCell = { ...baseCell, isRevealed: true };
      const { container } = render(
        <Cell
          cell={revealedCell}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = container.firstChild as HTMLElement;
      expect(button.className).toContain('bg-gray-200');
    });

    it('should have correct background color when revealed mine', () => {
      const revealedMine = { ...baseCell, isRevealed: true, isMine: true };
      const { container } = render(
        <Cell
          cell={revealedMine}
          onReveal={mockOnReveal}
          onFlag={mockOnFlag}
        />
      );

      const button = container.firstChild as HTMLElement;
      expect(button.className).toContain('bg-red-500');
    });
  });
}); 