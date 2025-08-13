import React, { useRef, useEffect, useCallback } from 'react';
import { Grid, Piece, TETROMINO_COLORS, shape, Cell } from '../tetris';

interface GameBoardProps {
  grid: Grid;
  currentPiece?: Piece;
  cellSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, currentPiece, cellSize = 24 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardWidth = grid[0].length;
  const boardHeight = grid.length;
  const canvasWidth = boardWidth * cellSize;
  const canvasHeight = boardHeight * cellSize;

  // Funktion för att rita en cell
  const drawCell = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, cell: Cell) => {
    const pixelX = x * cellSize;
    const pixelY = y * cellSize;
    
    if (cell === 0) {
      // Tom cell - rita bakgrund
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      
      // Subtila kanter för tomma celler
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
    } else {
      // Fylld cell med tetromino-färg
      const color = TETROMINO_COLORS[cell as keyof typeof TETROMINO_COLORS] || '#666';
      ctx.fillStyle = color;
      ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      
      // 3D-effekt med highlights och shadows
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pixelX, pixelY, cellSize, 2);
      ctx.fillRect(pixelX, pixelY, 2, cellSize);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(pixelX + cellSize - 2, pixelY, 2, cellSize);
      ctx.fillRect(pixelX, pixelY + cellSize - 2, cellSize, 2);
      
      // Cell-kant
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
    }
  }, [cellSize]);

  // Funktion för att rita hela spelplanen
  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
    // Rensa canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Rita bakgrund
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Rita alla celler
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        drawCell(ctx, x, y, grid[y][x]);
      }
    }
    
    // Rita nuvarande pjäs om den finns
    if (currentPiece) {
      const pieceShape = shape(currentPiece);
      for (let dy = 0; dy < pieceShape.length; dy++) {
        for (let dx = 0; dx < pieceShape[dy].length; dx++) {
          if (pieceShape[dy][dx]) {
            const x = currentPiece.x + dx;
            const y = currentPiece.y + dy;
            if (y >= 0 && y < boardHeight && x >= 0 && x < boardWidth) {
              drawCell(ctx, x, y, currentPiece.id as Cell);
            }
          }
        }
      }
    }
    
    // Rita spelplanens kant
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
  }, [grid, currentPiece, boardWidth, boardHeight, canvasWidth, canvasHeight, drawCell]);

  // Effekt för att rita om när props ändras
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Sätt canvas-storlek
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Aktivera anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Rita spelplanen
    drawBoard(ctx);
  }, [grid, currentPiece, canvasWidth, canvasHeight, drawBoard]);

  return (
    <div className="flex justify-center items-center p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-700 rounded-xl shadow-2xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

export default GameBoard;
