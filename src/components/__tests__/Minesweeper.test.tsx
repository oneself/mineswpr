import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Minesweeper } from '../Minesweeper';
import { GameConfig } from '../../types/minesweeper';
import * as gameUtils from '../../utils/gameUtils';

// Mock the gameUtils to control board creation and game logic
jest.mock('../../utils/gameUtils', () => ({
  createBoard: jest.fn(),
  revealCell: jest.fn(),
  checkWin: jest.fn(),
  autoRevealSafeCells: jest.fn(),
}));

describe('Minesweeper', () => {
  // Test configuration
  const config: GameConfig = {
    rows: 3,
    cols: 3,
    mines: 2,
  };

  // Helper function to create a test board
  const createTestBoard = () => {
    const board = Array(config.rows).fill(null).map((_, row) =>
      Array(config.cols).fill(null).map((_, col) => ({
        row,
        col,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
    // Place test mines
    board[0][0].isMine = true;
    board[1][1].isMine = true;
    return board;
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Mock createBoard to return our test board
    (gameUtils.createBoard as jest.Mock).mockReturnValue(createTestBoard());
    // Default mock returns for other functions
    (gameUtils.revealCell as jest.Mock).mockReturnValue(false);
    (gameUtils.checkWin as jest.Mock).mockReturnValue(false);
    (gameUtils.autoRevealSafeCells as jest.Mock).mockReturnValue({ hitMine: false });
  });

  it('should initialize game with correct configuration', () => {
    render(<Minesweeper initialConfig={config} />);
    
    expect(gameUtils.createBoard).toHaveBeenCalledWith(config);
    expect(screen.getAllByRole('button')).toHaveLength(config.rows * config.cols);
  });

  it('should handle revealing a safe cell', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    const cells = screen.getAllByRole('button');
    const safeCell = cells[2]; // Cell at (0,2) is safe in our test board
    
    await act(async () => {
      fireEvent.contextMenu(safeCell); // Right click to reveal
    });
    
    expect(gameUtils.revealCell).toHaveBeenCalled();
    expect(gameUtils.autoRevealSafeCells).toHaveBeenCalled();
    expect(gameUtils.checkWin).toHaveBeenCalled();
  });

  it('should handle revealing a mine', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    const cells = screen.getAllByRole('button');
    const mineCell = cells[0]; // Cell at (0,0) is a mine in our test board
    
    // Mock revealCell to return true (hit mine)
    (gameUtils.revealCell as jest.Mock).mockReturnValue(true);
    
    await act(async () => {
      fireEvent.contextMenu(mineCell);
    });
    
    // Should show game over modal
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    expect(screen.getByText('You hit a mine! 💥')).toBeInTheDocument();
  });

  it('should handle winning the game', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    // Mock checkWin to return true
    (gameUtils.checkWin as jest.Mock).mockReturnValue(true);
    
    const cells = screen.getAllByRole('button');
    const safeCell = cells[2];
    
    await act(async () => {
      fireEvent.contextMenu(safeCell);
    });
    
    // Should show win modal
    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('You\'ve won! 🎉')).toBeInTheDocument();
  });

  it('should handle flagging a cell', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    const cells = screen.getAllByRole('button');
    const cell = cells[0];
    
    // Flag the cell
    await act(async () => {
      fireEvent.click(cell);
    });
    
    expect(screen.getByText('🚩')).toBeInTheDocument();
  });

  it('should reset game when restart button is clicked', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    // First trigger game over
    const cells = screen.getAllByRole('button');
    (gameUtils.revealCell as jest.Mock).mockReturnValue(true);
    
    await act(async () => {
      fireEvent.contextMenu(cells[0]);
    });
    
    // Find and click restart button
    const restartButton = screen.getByText('Play Again');
    await act(async () => {
      fireEvent.click(restartButton);
    });
    
    // Should create new board
    expect(gameUtils.createBoard).toHaveBeenCalledTimes(2);
    // Modal should be closed
    expect(screen.queryByText('Game Over')).not.toBeInTheDocument();
  });

  it('should not allow cell interaction after game over', async () => {
    render(<Minesweeper initialConfig={config} />);
    
    // Trigger game over
    const cells = screen.getAllByRole('button');
    (gameUtils.revealCell as jest.Mock).mockReturnValue(true);
    
    // First reveal - should hit mine and trigger game over
    await act(async () => {
      fireEvent.contextMenu(cells[0]);
    });

    // Reset mock to verify next call
    (gameUtils.revealCell as jest.Mock).mockClear();
    
    // Try to interact with another cell after game over
    await act(async () => {
      fireEvent.contextMenu(cells[1]);
    });
    
    // Should not call reveal function after game over
    expect(gameUtils.revealCell).not.toHaveBeenCalled();
  });
}); 