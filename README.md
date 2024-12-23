# Minesweeper

A mobile-friendly implementation of the classic Minesweeper game using React, TypeScript, and Tailwind CSS.

## Features

- Three difficulty levels: Easy, Medium, and Hard
- Mobile-friendly with touch support
- Flag mines with right-click or long-press
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The game will be available at `http://localhost:3000`

## How to Play

- Left-click (or tap) to reveal a cell
- Right-click (or long-press on mobile) to flag a potential mine
- Select difficulty level from the dropdown menu
- Click Reset to start a new game

## Game Rules

1. The game board contains hidden mines
2. Numbers reveal how many mines are adjacent to a cell
3. Use logic to deduce which cells contain mines
4. Flag all mines and reveal all safe cells to win
5. Revealing a mine results in game over 