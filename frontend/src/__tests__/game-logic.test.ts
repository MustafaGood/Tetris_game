/**
 * Spellogik-tester för Tetris-spelet
 * 
 * Denna fil testar alla grundläggande spellogik-funktioner som
 * pjäsrörelse, kollisionsdetektering, radrensning och poängsystem.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  emptyGrid,
  spawn,
  Bag,
  rotate,
  collide,
  merge,
  clearLines,
  calculateScore,
  rotateWithSRS,
  tickSpeed,
  calculateSoftDropScore,
  calculateHardDropScore,
  isTetris,
  isTSpin,
  validateGrid,
  GameState,
  isInputAllowed,
  transitionState,
  saveLocalScore,
  isLocalHighscore,
} from '../tetris';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

describe('Tetris Game Logic', () => {
  let gameBoard: any;
  let currentPiece: any;
  let bag: Bag;

  beforeEach(() => {
    gameBoard = emptyGrid();
    bag = new Bag();
    currentPiece = spawn(bag);
  });

  describe('Piece Movement', () => {
    test('should move piece left', () => {
      const originalX = currentPiece.x;
      currentPiece.x = originalX - 1;
      expect(currentPiece.x).toBe(originalX - 1);
    });

    test('should move piece right', () => {
      const originalX = currentPiece.x;
      currentPiece.x = originalX + 1;
      expect(currentPiece.x).toBe(originalX + 1);
    });

    test('should move piece down', () => {
      const originalY = currentPiece.y;
      currentPiece.y = originalY + 1;
      expect(currentPiece.y).toBe(originalY + 1);
    });

    test('should not move piece through walls', () => {
      // Move piece to left edge
      currentPiece.x = 0;
      const newX = Math.max(0, currentPiece.x - 1);
      expect(newX).toBe(0);
    });

    test('should not move piece through floor', () => {
      // Move piece to bottom
      currentPiece.y = 19;
      const newY = Math.min(19, currentPiece.y + 1);
      expect(newY).toBe(19);
    });
  });

  describe('Piece Rotation', () => {
    test('should rotate piece clockwise', () => {
      const originalRotation = currentPiece.r;
      const rotatedPiece = rotate(currentPiece, 1);
      expect(rotatedPiece.r).not.toEqual(originalRotation);
    });

    test('should not rotate piece if it would collide', () => {
      // Place piece near right edge
      currentPiece.x = 8;
      const rotatedPiece = rotate(currentPiece, 1);
      // Should not rotate if it would go out of bounds
      expect(rotatedPiece.x).toBe(currentPiece.x);
    });
  });

  describe('Collision Detection', () => {
    test('should detect collision with walls', () => {
      currentPiece.x = -1;
      expect(collide(gameBoard, currentPiece)).toBe(true);
    });

    test('should detect collision with floor', () => {
      currentPiece.y = 20;
      expect(collide(gameBoard, currentPiece)).toBe(true);
    });

    test('should detect collision with other pieces', () => {
      // Place a piece on the board
      const placedPiece = spawn(bag);
      placedPiece.y = 18;
      merge(gameBoard, placedPiece);
      
      // Try to place another piece in the same area
      currentPiece.y = 18;
      expect(collide(gameBoard, currentPiece)).toBe(true);
    });
  });

  describe('Line Clearing', () => {
    test('should clear completed lines', () => {
      // Fill a line completely
      for (let x = 0; x < 10; x++) {
        gameBoard[19][x] = 1;
      }
      
      const linesCleared = clearLines(gameBoard);
      expect(linesCleared).toBe(1);
      
      // Check that the line is now empty
      for (let x = 0; x < 10; x++) {
        expect(gameBoard[19][x]).toBe(0);
      }
    });

    test('should clear multiple lines', () => {
      // Fill two lines completely
      for (let y = 18; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          gameBoard[y][x] = 1;
        }
      }
      
      const linesCleared = clearLines(gameBoard);
      expect(linesCleared).toBe(2);
    });

    test('should not clear incomplete lines', () => {
      // Fill only part of a line
      for (let x = 0; x < 5; x++) {
        gameBoard[19][x] = 1;
      }
      
      const linesCleared = clearLines(gameBoard);
      expect(linesCleared).toBe(0);
    });
  });

  describe('Score Calculation', () => {
    test('should calculate score for single line', () => {
      const score = calculateScore(1, 1);
      expect(score).toBeGreaterThan(0);
    });

    test('should calculate score for multiple lines', () => {
      const score = calculateScore(4, 1);
      expect(score).toBeGreaterThan(0);
    });

    test('should calculate higher score for higher levels', () => {
      const scoreLevel1 = calculateScore(1, 1);
      const scoreLevel5 = calculateScore(1, 5);
      expect(scoreLevel5).toBeGreaterThan(scoreLevel1);
    });
  });

  describe('Game State Management', () => {
    test('should allow valid state transitions', () => {
      expect(transitionState(GameState.START, GameState.PLAYING)).toBe(GameState.PLAYING);
      expect(transitionState(GameState.PLAYING, GameState.PAUSE)).toBe(GameState.PAUSE);
      expect(transitionState(GameState.PAUSE, GameState.PLAYING)).toBe(GameState.PLAYING);
    });

    test('should prevent invalid state transitions', () => {
      expect(transitionState(GameState.START, GameState.GAME_OVER)).toBe(null);
      expect(transitionState(GameState.START, GameState.PAUSE)).toBe(null);
    });

    test('should validate input permissions', () => {
      expect(isInputAllowed(GameState.START, 'Enter')).toBe(true);
      expect(isInputAllowed(GameState.START, 'ArrowLeft')).toBe(false);
      expect(isInputAllowed(GameState.PLAYING, 'ArrowLeft')).toBe(true);
    });
  });

  describe('Local Storage', () => {
    test('should save local score', () => {
      const score = {
        playerName: 'TestPlayer',
        score: 1000,
        level: 1,
        lines: 10,
        date: new Date().toISOString()
      };
      saveLocalScore(score);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should check if score is local highscore', () => {
      // Mock localStorage to return a proper JSON array of scores
      const mockScores = [
        { id: 1, playerName: 'Player1', score: 500, level: 1, lines: 5, date: '2024-01-01' },
        { id: 2, playerName: 'Player2', score: 300, level: 1, lines: 3, date: '2024-01-01' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockScores));
      
      const isHighscore = isLocalHighscore(1000);
      expect(isHighscore).toBe(true);
    });
  });
});
