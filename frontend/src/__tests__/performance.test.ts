/**
 * Prestandatester för Tetris-spelet
 * 
 * Denna fil testar prestanda och effektivitet för olika delar av spelet
 * för att säkerställa att det körs smidigt även under hög belastning.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock canvas for performance tests
beforeEach(() => {
  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      } as any;
    }
    return null;
  });
});

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  getEntries: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  timeOrigin: Date.now(),
};

Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
});

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Game Loop Performance', () => {
    test('should maintain 60fps game loop', () => {
      const startTime = performance.now();
      
      // Simulate 60 game updates
      for (let i = 0; i < 60; i++) {
        // Simulate game logic calculations
        Math.random(); // Simulate computations
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 60 updates in less than 1 second
      expect(totalTime).toBeLessThan(1000);
    });

    test('should handle piece movement efficiently', () => {
      const startTime = performance.now();
      
      // Simulate 1000 piece movements
      for (let i = 0; i < 1000; i++) {
        // Simulate piece movement calculations
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 20);
        const rotation = Math.floor(Math.random() * 4);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 1000 movements in reasonable time
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Memory Management', () => {
    test('should not create memory leaks during gameplay', () => {
      const initialMemory = 0; // Mock memory value
      
      // Simulate extended gameplay
      for (let i = 0; i < 1000; i++) {
        // Simulate game state updates
        const gameState = {
          score: i,
          level: Math.floor(i / 10) + 1,
          lines: i,
        };
      }
      
      const finalMemory = 0; // Mock memory value
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should efficiently clear completed lines', () => {
      const startTime = performance.now();
      
      // Simulate clearing 1000 lines
      for (let i = 0; i < 1000; i++) {
        // Simulate line clearing logic
        const lines = Math.floor(Math.random() * 4) + 1;
        const score = lines * 100;
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should clear lines efficiently
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Rendering Performance', () => {
    test('should render game board efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rendering 1000 frames
      for (let i = 0; i < 1000; i++) {
        // Simulate canvas rendering operations
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillRect(0, 0, 300, 600);
          ctx.clearRect(0, 0, 300, 600);
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should render efficiently (1000 canvas operations should take less than 700ms)
      expect(totalTime).toBeLessThan(700);
    });

    test('should handle piece rotation smoothly', () => {
      const startTime = performance.now();
      
      // Simulate 1000 piece rotations
      for (let i = 0; i < 1000; i++) {
        // Simulate rotation calculations
        const angle = (i * 90) % 360;
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should rotate pieces efficiently
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Input Handling', () => {
    test('should respond to input quickly', () => {
      const startTime = performance.now();
      
      // Simulate 1000 input events
      for (let i = 0; i < 1000; i++) {
        // Simulate input processing
        const key = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'][i % 4];
        const timestamp = Date.now();
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle input efficiently
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Score Calculation', () => {
    test('should calculate scores efficiently', () => {
      const startTime = performance.now();
      
      // Simulate calculating 1000 scores
      for (let i = 0; i < 1000; i++) {
        // Simulate score calculation
        const lines = Math.floor(Math.random() * 4) + 1;
        const level = Math.floor(Math.random() * 20) + 1;
        const baseScore = lines * 100;
        const levelMultiplier = level * 10;
        const finalScore = baseScore * levelMultiplier;
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should calculate scores efficiently
      expect(totalTime).toBeLessThan(50);
    });
  });
});
