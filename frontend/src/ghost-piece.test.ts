// ========================================
// GHOST PIECE TESTER
// ========================================
// Denna fil testar funktionaliteten för "ghost piece" - en förhandsvisning
// som visar var en spelbit kommer att landa när den faller

import { describe, it, expect } from 'vitest';
import { 
  emptyGrid, 
  getGhostPiecePosition, 
  shouldShowGhostPiece, 
  GameState, 
  W, 
  H 
} from './tetris';

// Testar alla ghost piece funktioner
describe('Ghost Piece Functions', () => {
  
  // Test 1: Kontrollerar att ghost piece position beräknas korrekt
  it('should calculate ghost piece position correctly', () => {
    const grid = emptyGrid();  // Skapa ett tomt spelbräde
    const piece = { id: 1, r: 0, x: 3, y: 0 };  // I-form bit på toppen
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    // Ghost piece ska finnas och ha samma egenskaper som original
    expect(ghostPiece).not.toBeNull();
    expect(ghostPiece!.id).toBe(piece.id);      // Samma bittyp
    expect(ghostPiece!.r).toBe(piece.r);        // Samma rotation
    expect(ghostPiece!.x).toBe(piece.x);        // Samma x-position
    expect(ghostPiece!.y).toBeGreaterThan(piece.y);  // Men lägre y-position (närmare golvet)
  });

  // Test 2: Kontrollerar att ghost piece inte visas när biten redan är på golvet
  it('should return null when piece is at bottom', () => {
    const grid = emptyGrid();  // Tomt spelbräde
    const piece = { id: 1, r: 0, x: 3, y: 18 };  // Bit nästan på golvet
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    // Ingen ghost piece ska visas eftersom biten redan är på golvet
    expect(ghostPiece).toBeNull();
  });

  // Test 3: Kontrollerar att ghost piece hanterar blockerade positioner korrekt
  it('should handle piece blocked by other pieces', () => {
    const grid = emptyGrid();  // Tomt spelbräde

    // Skapa en full rad på botten för att blockera bitar
    for (let x = 0; x < W; x++) {
      grid[H-1][x] = 1;  // Fyll bottenraden med bitar
    }
    
    const piece = { id: 1, r: 0, x: 3, y: 17 };  // Bit precis ovanför blockerade raden
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    // Ingen ghost piece ska visas eftersom biten inte kan falla längre
    expect(ghostPiece).toBeNull();
  });

  // Test 4: Kontrollerar att ghost piece bara visas under spel
  it('should show ghost piece only in playing state', () => {
    const piece = { id: 1, r: 0, x: 3, y: 0 };      // Aktuell bit
    const ghostPiece = { id: 1, r: 0, x: 3, y: 15 }; // Ghost piece på position 15
    
    // Ghost piece ska bara visas när spelet pågår
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PLAYING)).toBe(true);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PAUSE)).toBe(false);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.START)).toBe(false);
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.GAME_OVER)).toBe(false);
  });

  // Test 5: Kontrollerar att ghost piece inte visas när den är på samma nivå
  it('should not show ghost piece when pieces are at same level', () => {
    const piece = { id: 1, r: 0, x: 3, y: 15 };     // Aktuell bit på nivå 15
    const ghostPiece = { id: 1, r: 0, x: 3, y: 15 }; // Ghost piece på samma nivå
    
    // Ingen ghost piece ska visas eftersom de är på samma position
    expect(shouldShowGhostPiece(piece, ghostPiece, GameState.PLAYING)).toBe(false);
  });

  // Test 6: Kontrollerar att ghost piece inte visas när den är null
  it('should not show ghost piece when ghost piece is null', () => {
    const piece = { id: 1, r: 0, x: 3, y: 0 };  // Aktuell bit
    
    // Ingen ghost piece ska visas när ghost piece är null
    expect(shouldShowGhostPiece(piece, null, GameState.PLAYING)).toBe(false);
  });

  // Test 7: Kontrollerar att ghost piece fungerar med olika bittyper
  it('should handle different piece types correctly', () => {
    const grid = emptyGrid();  // Tomt spelbräde
    
    // Testa olika typer av bitar
    const pieces = [
      { id: 1, r: 0, x: 3, y: 0 },  // I-form (lång rak)
      { id: 2, r: 0, x: 3, y: 0 },  // J-form (L-formad)
      { id: 4, r: 0, x: 4, y: 0 },  // O-form (kvadratisk)
      { id: 6, r: 0, x: 3, y: 0 },  // T-form (T-formad)
    ];
    
    // Kontrollera att varje bittyp får en korrekt ghost piece
    pieces.forEach(piece => {
      const ghostPiece = getGhostPiecePosition(piece, grid);
      if (ghostPiece) {
        expect(ghostPiece.id).toBe(piece.id);      // Samma bittyp
        expect(ghostPiece.r).toBe(piece.r);        // Samma rotation
        expect(ghostPiece.x).toBe(piece.x);        // Samma x-position
        expect(ghostPiece.y).toBeGreaterThan(piece.y);  // Lägre y-position
      }
    });
  });

  // Test 8: Kontrollerar att ghost piece fungerar med roterade bitar
  it('should handle rotated pieces correctly', () => {
    const grid = emptyGrid();  // Tomt spelbräde
    const piece = { id: 1, r: 1, x: 3, y: 0 };  // I-form roterad 90 grader
    const ghostPiece = getGhostPiecePosition(piece, grid);
    
    // Ghost piece ska finnas och behålla rotationen
    expect(ghostPiece).not.toBeNull();
    expect(ghostPiece!.r).toBe(piece.r);        // Samma rotation
    expect(ghostPiece!.y).toBeGreaterThan(piece.y);  // Lägre y-position
  });
});
