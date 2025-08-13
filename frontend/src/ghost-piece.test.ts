import { describe, it, expect } from 'vitest';
import { 
  emptyGrid, 
  getGhostPiecePosition, 
  shouldShowGhostPiece, 
  GameState, 
  W, 
  H 
} from './tetris';

describe('Ghost Piece Functions', () => {
  it('should calculate ghost piece position correctly', () => {
    const grid = emptyGrid();
    const piece = { id: 1, r: 0, x: 3, y: 0 }; // I-piece at top
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    expect(ghostPiece).not.toBeNull();
    expect(ghostPiece!.id).toBe(piece.id);
    expect(ghostPiece!.r).toBe(piece.r);
    expect(ghostPiece!.x).toBe(piece.x);
    expect(ghostPiece!.y).toBeGreaterThan(piece.y); // Should be below current piece
  });

  it('should return null when piece is at bottom', () => {
    const grid = emptyGrid();
    const piece = { id: 1, r: 0, x: 3, y: 18 }; // I-piece near bottom
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    expect(ghostPiece).toBeNull();
  });

  it('should handle piece blocked by other pieces', () => {
    const grid = emptyGrid();
    // Fill bottom row with pieces
    for (let x = 0; x < W; x++) {
      grid[H-1][x] = 1;
    }
    
    const piece = { id: 1, r: 0, x: 3, y: 17 }; // I-piece above filled row
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    expect(ghostPiece).toBeNull(); // Should return null when piece is at same level as ghost would be
  });

  it('should show ghost piece only in playing state', () => {
    const piece = { id: 1, r: 0, x: 3, y: 0 };
    const ghostPiece = { id: 1, r: 0, x: 3, y: 15 };
    
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PLAYING)).toBe(true);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PAUSE)).toBe(false);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.START)).toBe(false);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.GAME_OVER)).toBe(false);
  });

  it('should not show ghost piece when pieces are at same level', () => {
    const piece = { id: 1, r: 0, x: 3, y: 15 };
    const ghostPiece = { id: 1, r: 0, x: 3, y: 15 }; // Same y position
    
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PLAYING)).toBe(false);
  });

  it('should not show ghost piece when ghost piece is null', () => {
    const piece = { id: 1, r: 0, x: 3, y: 0 };
    
    expect(shouldShowGhostPiece(piece, null, GameState.PLAYING)).toBe(false);
  });

  it('should handle different piece types correctly', () => {
    const grid = emptyGrid();
    
    // Test with different piece types
    const pieces = [
      { id: 1, r: 0, x: 3, y: 0 }, // I-piece
      { id: 2, r: 0, x: 3, y: 0 }, // J-piece
      { id: 4, r: 0, x: 4, y: 0 }, // O-piece
      { id: 6, r: 0, x: 3, y: 0 }, // T-piece
    ];
    
    pieces.forEach(piece => {
      const ghostPiece = getGhostPiecePosition(piece, grid);
      if (ghostPiece) {
        expect(ghostPiece.id).toBe(piece.id);
        expect(ghostPiece.r).toBe(piece.r);
        expect(ghostPiece.x).toBe(piece.x);
        expect(ghostPiece.y).toBeGreaterThan(piece.y);
      }
    });
  });

  it('should handle rotated pieces correctly', () => {
    const grid = emptyGrid();
    const piece = { id: 1, r: 1, x: 3, y: 0 }; // I-piece rotated 90 degrees
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    expect(ghostPiece).not.toBeNull();
    expect(ghostPiece!.r).toBe(piece.r);
    expect(ghostPiece!.y).toBeGreaterThan(piece.y);
  });
});
