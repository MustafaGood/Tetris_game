import React from 'react';
import { Grid, Piece, TETROMINO_COLORS, shape, Cell } from '../tetris';

interface GameBoardProps {
  grid: Grid;
  currentPiece?: Piece;
  cellSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, currentPiece, cellSize = 24 }) => {
  // Skapar en kopia av spelplanen för att visa nuvarande pjäs
  const displayGrid = grid.map(row => [...row]);
  
  // Lägger till nuvarande pjäs på spelplanen för visning
  if (currentPiece) {
    const pieceShape = shape(currentPiece);
    for (let dy = 0; dy < pieceShape.length; dy++) {
      for (let dx = 0; dx < pieceShape[dy].length; dx++) {
        if (pieceShape[dy][dx]) {
          const x = currentPiece.x + dx;
          const y = currentPiece.y + dy;
          if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
            displayGrid[y][x] = currentPiece.id as Cell;
          }
        }
      }
    }
  }

  return (
    <div 
      className="grid gap-0.5 bg-gray-900 p-4 rounded-xl border-2 border-gray-700 shadow-2xl"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${grid.length}, ${cellSize}px)`,
      }}
    >
      {displayGrid.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="w-full h-full rounded-sm transition-all duration-150 border border-gray-800"
            style={{
              backgroundColor: cell ? TETROMINO_COLORS[cell as keyof typeof TETROMINO_COLORS] || '#666' : 'transparent',
              boxShadow: cell 
                ? 'inset 0 0 0 1px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)' 
                : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
