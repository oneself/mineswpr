
# Minesweeper


Minesweeper is a classic single-player puzzle game where the objective is to
clear a rectangular board containing hidden mines without detonating any of
them. Here's how it works:

1. **Board Setup**: The game starts with a rectangular grid of cells, with some
   cells randomly seeded with mines. The number of mines is predetermined and
   can vary based on the difficulty level.

2. **Cell Representation**: Each cell on the board can be in one of three
   states:
   - Untouched: The initial state of all cells.
   - Opened: A cell that has been clicked and is not a mine. It displays a
     number indicating how many adjacent cells contain mines.
   - Flagged: A cell that the player has marked as potentially containing a
     mine.

3. **Opening Cells**: The player left-clicks on an untouched cell to open it. If
   the cell contains a mine, the game ends with a loss. Otherwise, the cell
   displays a number representing the count of adjacent mines. If there are no
   adjacent mines, the cell is blank, and all adjacent untouched cells are
   automatically opened (a recursive process).
4. **Flagging Mines**: The player can right-click on an untouched cell to flag
   it as a potential mine. This is useful for keeping track of suspected mine
   locations.
5. **Revealing Adjacent Cells**: If a player opens a cell and the number
   displayed matches the number of flagged adjacent cells, all remaining
   untouched adjacent cells can be automatically opened, as they are guaranteed
   to be safe.
6. **Winning**: The player wins the game when all non-mine cells have been
   opened without detonating any mines.

To implement Minesweeper, you'll need to:
1. Create a data structure to represent the board and track the state of each
   cell (untouched, opened, or flagged).
2. Implement a function to randomly distribute mines on the board during setup.
3. Handle left-click events to open a cell and perform recursive opening if it's
   a safe cell.
4. Handle right-click events to flag/unflag potential mines.
5. Implement a function to check if all non-mine cells have been opened (win
   condition).
6. Handle the game over scenario when a mine is detonated.
7. Game should be web mobile friendly.

The core logic involves tracking the state of each cell, handling user
interactions (clicks), and implementing the rules for opening cells and
revealing adjacent cells based on the mine count.

Implementation Details
1. **Langage**: Typescript
2. **Front-end Framework**: React
3. **Mobile friendly CSS**: Tailwind CSS
