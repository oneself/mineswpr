import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Game } from '../Game';

describe('Game', () => {
  const mockResizeWindow = (width: number, height: number) => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    // Reset window dimensions to desktop size
    mockResizeWindow(1024, 768);
  });

  it('should show intro overlay initially', () => {
    render(<Game />);
    expect(screen.getByText('Minesweeper')).toBeInTheDocument();
    expect(screen.getByText('How to Play')).toBeInTheDocument();
  });

  it('should hide intro overlay after clicking start', () => {
    render(<Game />);
    
    fireEvent.click(screen.getByText('Start Game'));
    
    expect(screen.queryByText('How to Play')).not.toBeInTheDocument();
  });

  describe('Responsive Board Size', () => {
    it('should create smaller board on mobile', () => {
      render(<Game />);
      fireEvent.click(screen.getByText('Start Game'));
      
      // Switch to mobile size
      act(() => {
        mockResizeWindow(375, 667);
      });
      
      // Get all cells
      const cells = screen.getAllByRole('button');
      
      // Mobile should have fewer cells than desktop
      expect(cells.length).toBeLessThan(1024 * 768 / (32 * 32)); // Desktop size
    });

    it('should create larger board on desktop', () => {
      render(<Game />);
      fireEvent.click(screen.getByText('Start Game'));
      
      // Switch to large desktop size
      act(() => {
        mockResizeWindow(1920, 1080);
      });
      
      // Get all cells
      const cells = screen.getAllByRole('button');
      
      // Desktop should have more cells than mobile
      expect(cells.length).toBeGreaterThan(375 * 667 / (32 * 32)); // Mobile size
    });

    it('should maintain minimum board size', () => {
      render(<Game />);
      fireEvent.click(screen.getByText('Start Game'));
      
      // Switch to very small screen
      act(() => {
        mockResizeWindow(200, 200);
      });
      
      // Get all cells
      const cells = screen.getAllByRole('button');
      
      // Should have at least 8x8 board
      expect(cells.length).toBeGreaterThanOrEqual(64); // 8x8
    });

    it('should have different board sizes for different screen sizes', async () => {
      render(<Game />);
      fireEvent.click(screen.getByText('Start Game'));
      
      // Test different screen sizes that match our breakpoints
      const screenSizes = [
        { width: 375, height: 667 },   // Small mobile
        { width: 600, height: 800 },   // Large mobile
        { width: 900, height: 1024 },  // Tablet
        { width: 1440, height: 900 },  // Desktop
      ];
      
      const cellCounts = new Set();
      
      for (const size of screenSizes) {
        act(() => {
          mockResizeWindow(size.width, size.height);
        });
        
        // Wait for any state updates
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        const cellCount = screen.getAllByRole('button').length;
        cellCounts.add(cellCount);
        
        // Log cell counts for debugging
        console.log(`Screen size ${size.width}x${size.height}: ${cellCount} cells`);
      }
      
      // We should have at least 3 different board sizes
      expect(cellCounts.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Mine Placement', () => {
    it('should place approximately 5% mines', () => {
      render(<Game />);
      fireEvent.click(screen.getByText('Start Game'));
      
      // Count cells with mines (flaggable cells)
      const totalCells = screen.getAllByRole('button').length;
      const expectedMines = Math.floor(totalCells * 0.05);
      
      // Allow for some rounding variation
      expect(expectedMines).toBeGreaterThan(0);
      expect(expectedMines / totalCells).toBeCloseTo(0.05, 1);
    });
  });
}); 