import React, { useRef, useEffect, useCallback } from 'react';
import { Grid, Piece, TETROMINO_COLORS, shape, Cell, GameState, getGhostPiecePosition, shouldShowGhostPiece } from '../tetris';

// Komponent: GameBoard
// Svenska kommentarer: Renderar spelbrädet i en <canvas>. Ansvar:
// - Rita statiska celler
// - Rita den aktiva biten
// - Rita ghost-piece (transparent) när aktiverad
// Canvas-ritningen optimeras genom att beräkna pixeldimensioner en gång per render.

interface GameBoardProps {
  grid: Grid;
  currentPiece?: Piece;
  cellSize?: number;
  gameState?: GameState;
  ghostPieceEnabled?: boolean;
}

// Komponent: StateOverlay
// Visar överlagring för olika spelstatus (start, paus, game over)
// Använder semi-transparent bakgrund med tydlig text
const StateOverlay: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  // Hjälpfunktion: Returnerar text och färg baserat på spelstatus
  const getStateInfo = () => {
    switch (gameState) {
      case GameState.START:
        return { text: 'Tryck Start för att börja', color: 'text-blue-400' };
      case GameState.PAUSE:
        return { text: 'PAUSAT', color: 'text-yellow-400' };
      case GameState.GAME_OVER:
        return { text: 'GAME OVER', color: 'text-red-400' };
      default:
        return null;
    }
  };

  const stateInfo = getStateInfo();
  if (!stateInfo) return null;

  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
      <div className="bg-gray-900/90 p-6 rounded-xl border border-gray-600 text-center">
        <h2 className={`text-3xl font-bold ${stateInfo.color} mb-2`}>
          {stateInfo.text}
        </h2>
        {gameState === GameState.START && (
          <p className="text-gray-300 text-sm">Tryck Enter eller Space</p>
        )}
        {gameState === GameState.PAUSE && (
          <p className="text-gray-300 text-sm">Tryck P eller Esc för att fortsätta</p>
        )}
        {gameState === GameState.GAME_OVER && (
          <p className="text-gray-300 text-sm">Tryck Enter för att spela igen</p>
        )}
      </div>
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({ grid, currentPiece, cellSize = 24, gameState, ghostPieceEnabled = true }) => {
  // Canvas-referens för att kunna rita på canvas-elementet
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Beräkna bräddimensioner baserat på grid-storlek och cell-storlek
  const boardWidth = grid[0].length;
  const boardHeight = grid.length;
  const canvasWidth = boardWidth * cellSize;
  const canvasHeight = boardHeight * cellSize;

  // Funktion: Rita en enskild cell på canvas
  // Använder useCallback för att optimera prestanda - funktionen skapas bara om cellSize ändras
  const drawCell = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, cell: Cell) => {
    // Konvertera grid-koordinater till pixel-koordinater
    const pixelX = x * cellSize;
    const pixelY = y * cellSize;
    
    if (cell === 0) {
      // Tom cell: Rita transparent vit bakgrund med subtil ram
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      
      // Lägg till subtil ram för tomma celler
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
    } else {
      // Fylld cell: Rita med färg från TETROMINO_COLORS
      const color = TETROMINO_COLORS[cell as keyof typeof TETROMINO_COLORS] || '#666';
      ctx.fillStyle = color;
      ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      
      // Lägg till 3D-effekt med ljusare kanter (top och left)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pixelX, pixelY, cellSize, 2);
      ctx.fillRect(pixelX, pixelY, 2, cellSize);
      
      // Lägg till 3D-effekt med mörkare kanter (bottom och right)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(pixelX + cellSize - 2, pixelY, 2, cellSize);
      ctx.fillRect(pixelX, pixelY + cellSize - 2, cellSize, 2);
      
      // Lägg till ram runt fyllda celler
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
    }
  }, [cellSize]);

  // Funktion: Rita en ghost cell (transparent version av aktiva biten)
  // Ghost piece visar var biten kommer att landa när den faller
  const drawGhostCell = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, pieceId: number) => {
    // Konvertera grid-koordinater till pixel-koordinater
    const pixelX = x * cellSize;
    const pixelY = y * cellSize;
    
    // Hämta färgen för denna bit-typ
    const color = TETROMINO_COLORS[pieceId as keyof typeof TETROMINO_COLORS] || '#666';
    
    // Skapa transparent version av färgen (4D = 30% opacity)
    const transparentColor = color + '4D';
    ctx.fillStyle = transparentColor;
    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
    
    // Lägg till transparent ram (80 = 50% opacity)
    ctx.strokeStyle = color + '80';
    ctx.lineWidth = 1;
    ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
  }, [cellSize]);

  // Funktion: Rita hela spelbrädet
  // Denna funktion körs varje gång grid, currentPiece eller gameState ändras
  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
    // Rensa canvas helt
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Rita bakgrundsfärg för hela brädet
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Rita alla statiska celler från grid
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        drawCell(ctx, x, y, grid[y][x]);
      }
    }
    
    // Rita ghost piece om det är aktiverat och spelet pågår
    if (currentPiece && gameState === GameState.PLAYING && ghostPieceEnabled) {
      // Beräkna var ghost piece ska visas (längst ner möjligt)
      const ghostPiece = getGhostPiecePosition(currentPiece, grid);
      if (shouldShowGhostPiece(currentPiece, ghostPiece, gameState)) {
        // Hämta formen för ghost piece
        const ghostShape = shape(ghostPiece!);
        // Rita varje cell i ghost piece
        for (let dy = 0; dy < ghostShape.length; dy++) {
          for (let dx = 0; dx < ghostShape[dy].length; dx++) {
            if (ghostShape[dy][dx]) {
              const x = ghostPiece!.x + dx;
              const y = ghostPiece!.y + dy;
              // Kontrollera att vi ritar inom brädet
              if (y >= 0 && y < boardHeight && x >= 0 && x < boardWidth) {
                drawGhostCell(ctx, x, y, ghostPiece!.id);
              }
            }
          }
        }
      }
    }
    
    // Rita den aktiva biten ovanpå allt annat
    if (currentPiece) {
      // Hämta formen för den aktiva biten
      const pieceShape = shape(currentPiece);
      // Rita varje cell i den aktiva biten
      for (let dy = 0; dy < pieceShape.length; dy++) {
        for (let dx = 0; dx < pieceShape[dy].length; dx++) {
          if (pieceShape[dy][dx]) {
            const x = currentPiece.x + dx;
            const y = currentPiece.y + dy;
            // Kontrollera att vi ritar inom brädet
            if (y >= 0 && y < boardHeight && x >= 0 && x < boardWidth) {
              drawCell(ctx, x, y, currentPiece.id as Cell);
            }
          }
        }
      }
    }
    
    // Rita ram runt hela spelbrädet
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
  }, [grid, currentPiece, gameState, ghostPieceEnabled, boardWidth, boardHeight, canvasWidth, canvasHeight, drawCell, drawGhostCell]);

  // useEffect: Körs när komponenten renderas eller när dependencies ändras
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Hämta 2D rendering context från canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Sätt canvas dimensioner (detta påverkar pixel-upplösningen)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Aktivera anti-aliasing för smidigare rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Rita brädet med den nya kontexten
    drawBoard(ctx);
  }, [grid, currentPiece, canvasWidth, canvasHeight, drawBoard]);

  return (
    <div className="flex justify-center items-center p-4">
      <div className="relative">
        {/* Canvas-elementet där all rendering sker */}
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-700 rounded-xl shadow-2xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            display: 'block',
          }}
        />
        {/* Visa status-overlay om det finns en gameState */}
        {gameState && <StateOverlay gameState={gameState} />}
      </div>
    </div>
  );
};

export default GameBoard;
