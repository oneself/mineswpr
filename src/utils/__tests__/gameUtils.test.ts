import { createBoard, getNeighbors, revealCell, checkWin, autoRevealSafeCells } from '../gameUtils';
import { Cell, GameConfig } from '../../types/minesweeper';

describe('gameUtils', () => {
  describe('createBoard', () => {
    it('should create a board with correct dimensions', () => {
      const config: GameConfig = { rows: 3, cols: 4, mines: 2 };
      const board = createBoard(config);
      
      expect(board.length).toBe(3);
      expect(board[0].length).toBe(4);
    });

    it('should initialize cells with correct default values', () => {
      const config: GameConfig = { rows: 2, cols: 2, mines: 1 };
      const board = createBoard(config);
      
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          const cell = board[row][col];
          expect(cell).toMatchObject({
            row,
            col,
            isRevealed: false,
            isFlagged: false,
          });
        }
      }
    });

    it('should place correct number of mines', () => {
      const config: GameConfig = { rows: 3, cols: 3, mines: 2 };
      const board = createBoard(config);
      
      const mineCount = board.flat().filter(cell => cell.isMine).length;
      expect(mineCount).toBe(2);
    });
  });

  describe('getNeighbors', () => {
    let board: Cell[][];

    beforeEach(() => {
      board = createBoard({ rows: 3, cols: 3, mines: 0 });
    });

    it('should return all 8 neighbors for center cell', () => {
      const neighbors = getNeighbors(board, 1, 1);
      expect(neighbors.length).toBe(8);
    });

    it('should return 3 neighbors for corner cell', () => {
      const neighbors = getNeighbors(board, 0, 0);
      expect(neighbors.length).toBe(3);
    });

    it('should return 5 neighbors for edge cell', () => {
      const neighbors = getNeighbors(board, 0, 1);
      expect(neighbors.length).toBe(5);
    });
  });

  describe('revealCell', () => {
    let board: Cell[][];

    beforeEach(() => {
      // Create a 3x3 board with one mine at (1,1)
      board = createBoard({ rows: 3, cols: 3, mines: 0 });
      board[1][1].isMine = true;
      // Update neighbor counts
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (!board[row][col].isMine) {
            board[row][col].neighborMines = getNeighbors(board, row, col)
              .filter(cell => cell.isMine).length;
          }
        }
      }
    });

    it('should reveal cell and return false when revealing safe cell', () => {
      const hitMine = revealCell(board, 0, 0);
      expect(hitMine).toBe(false);
      expect(board[0][0].isRevealed).toBe(true);
    });

    it('should return true when revealing mine', () => {
      const hitMine = revealCell(board, 1, 1);
      expect(hitMine).toBe(true);
      expect(board[1][1].isRevealed).toBe(true);
    });

    it('should not reveal flagged cells', () => {
      board[0][0].isFlagged = true;
      const hitMine = revealCell(board, 0, 0);
      expect(hitMine).toBe(false);
      expect(board[0][0].isRevealed).toBe(false);
    });
  });

  describe('checkWin', () => {
    let board: Cell[][];

    beforeEach(() => {
      // Create a board with no mines first
      board = createBoard({ rows: 2, cols: 2, mines: 0 });
      // Place mine at (0,0)
      board[0][0].isMine = true;
      // Update neighbor counts
      board[0][1].neighborMines++;
      board[1][0].neighborMines++;
      board[1][1].neighborMines++;
      // Reset all cells to unrevealed and unflagged
      board.forEach(row => row.forEach(cell => {
        cell.isRevealed = false;
        cell.isFlagged = false;
      }));
    });

    it('should return true when all mines are correctly flagged and no safe cells are flagged', () => {
      // Flag only the mine
      board[0][0].isFlagged = true;
      
      expect(checkWin(board)).toBe(true);
    });

    it('should return false when mine is not flagged', () => {
      // Don't flag the mine
      expect(checkWin(board)).toBe(false);
    });

    it('should return false when safe cell is incorrectly flagged', () => {
      // Flag mine correctly but also flag a safe cell
      board[0][0].isFlagged = true;
      board[0][1].isFlagged = true;
      
      expect(checkWin(board)).toBe(false);
    });

    it('should return false when wrong cell is flagged instead of mine', () => {
      // Flag wrong cell instead of mine
      board[0][1].isFlagged = true;
      
      expect(checkWin(board)).toBe(false);
    });
  });

  describe('autoRevealSafeCells', () => {
    let board: Cell[][];

    beforeEach(() => {
      // Create a 3x3 board with one mine at (1,1)
      board = createBoard({ rows: 3, cols: 3, mines: 0 });
      board[1][1].isMine = true;
      // Update neighbor counts
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (!board[row][col].isMine) {
            board[row][col].neighborMines = getNeighbors(board, row, col)
              .filter(cell => cell.isMine).length;
          }
        }
      }
    });

    it('should auto-reveal safe cells when mine is correctly flagged', () => {
      // Reveal a cell with number
      board[0][0].isRevealed = true;
      // Flag the mine
      board[1][1].isFlagged = true;
      
      const result = autoRevealSafeCells(board);
      expect(result.hitMine).toBe(false);
      
      // Check that safe neighbors are revealed
      expect(board[0][1].isRevealed).toBe(true);
      expect(board[1][0].isRevealed).toBe(true);
    });

    it('should return hitMine true if reveals a mine', () => {
      // Reveal a cell with number
      board[0][0].isRevealed = true;
      // Incorrectly flag a safe cell
      board[0][1].isFlagged = true;
      
      const result = autoRevealSafeCells(board);
      expect(result.hitMine).toBe(true);
    });

    it('should recursively reveal all connected cells with zero neighboring mines', () => {
      // Create a 5x5 board with a cluster of safe cells
      board = createBoard({ rows: 5, cols: 5, mines: 0 });
      
      // Place mines in a pattern that creates a cluster of safe cells
      board[0][0].isMine = true;
      board[4][4].isMine = true;
      
      // Update neighbor counts
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!board[row][col].isMine) {
            board[row][col].neighborMines = getNeighbors(board, row, col)
              .filter(cell => cell.isMine).length;
          }
        }
      }

      // Reveal a cell in the middle (should have zero neighbors)
      board[2][2].isRevealed = true;
      
      const result = autoRevealSafeCells(board);
      expect(result.hitMine).toBe(false);
      
      // Verify that all safe cells with zero neighbors and their adjacent cells are revealed
      // Check a few key positions that should be revealed
      expect(board[1][1].isRevealed).toBe(true);
      expect(board[1][2].isRevealed).toBe(true);
      expect(board[1][3].isRevealed).toBe(true);
      expect(board[2][1].isRevealed).toBe(true);
      expect(board[2][3].isRevealed).toBe(true);
      expect(board[3][1].isRevealed).toBe(true);
      expect(board[3][2].isRevealed).toBe(true);
      expect(board[3][3].isRevealed).toBe(true);
      
      // Verify that cells near mines are not revealed
      expect(board[0][0].isRevealed).toBe(false);
      expect(board[4][4].isRevealed).toBe(false);
    });
  });
}); 