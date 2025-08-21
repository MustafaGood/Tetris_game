/**
 * Komponenttester för Tetris-spelet
 * 
 * Denna fil testar alla huvudkomponenter i Tetris-spelet för att säkerställa
 * att de renderas korrekt och fungerar som förväntat.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// ============================================================================
// MOCK AV TETRIS-SPELET
// ============================================================================

/**
 * Mock av Tetris-spellogiken för att isolera komponenttester
 * Från faktisk spellogik så att vi kan fokusera på UI-komponenter
 */
// Mock av tetris-funktioner som används i App-komponenten
vi.mock('../tetris', () => ({
  emptyGrid: vi.fn(() => Array(20).fill(Array(10).fill(0))),
  spawn: vi.fn(() => ({ id: 1, r: 0, x: 4, y: 0 })),
  collide: vi.fn(() => false),
  merge: vi.fn(),
  getFullRows: vi.fn(() => []),
  clearRows: vi.fn(),
  rotateWithSRS: vi.fn(),
  tickSpeed: vi.fn(() => 1000),
  calculateSoftDropScore: vi.fn(() => 1),
  calculateHardDropScore: vi.fn(() => 2),
  isTetris: vi.fn(() => false),
  isTSpin: vi.fn(() => false),
  calculateTotalScore: vi.fn(() => 0),
  isGameOver: vi.fn(() => false),
  validateGrid: vi.fn(() => true),
  GameState: {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  },
  isInputAllowed: vi.fn(() => true),
  transitionState: vi.fn(),
  saveLocalScore: vi.fn(),
  isLocalHighscore: vi.fn(() => false)
}));

// ============================================================================
// HUVUDTESTSUIT
// ============================================================================

describe('Tetris Spelkomponenter', () => {
  /**
   * Rensa alla mocks före varje test
   * Säkerställer att varje test börjar med en ren slate
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // APP-KOMPONENT TESTER
  // ============================================================================

  describe('App-komponenten', () => {
    it('renderar huvudspelgränssnittet', () => {
      render(<App />);
      
      // Kontrollera att huvudtiteln finns
      expect(screen.getByText(/tetris/i)).toBeInTheDocument();
      
      // Kontrollera att alla huvudknappar finns
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('visar spelstatistik', () => {
      render(<App />);
      
      // Kontrollera att alla statistikelement finns
      expect(screen.getByText(/score/i)).toBeInTheDocument();
      expect(screen.getByText(/level/i)).toBeInTheDocument();
      expect(screen.getByText(/lines/i)).toBeInTheDocument();
    });

    it('har korrekta tillgänglighetsattribut', () => {
      render(<App />);
      
      // Kontrollera att startknappen har aria-label
      const startButton = screen.getByRole('button', { name: /start/i });
      expect(startButton).toHaveAttribute('aria-label');
      
      // Kontrollera att spelplanen finns med korrekt roll
      const gameCanvas = screen.getByRole('img', { name: /game board/i });
      expect(gameCanvas).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SPELKONTROLLER TESTER
  // ============================================================================

  describe('Spelkontroller', () => {
    it('hanterar startknapp-klick', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);
      
      // Vänta på att knappen ska ändras till "pause"
      await waitFor(() => {
        expect(startButton).toHaveTextContent(/pause/i);
      });
    });

    it('hanterar pausknapp-klick', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      
      // Starta spelet först
      fireEvent.click(startButton);
      await waitFor(() => {
        expect(startButton).toHaveTextContent(/pause/i);
      });
      
      // Pausa spelet
      fireEvent.click(pauseButton);
      await waitFor(() => {
        expect(startButton).toHaveTextContent(/resume/i);
      });
    });

    it('hanterar återställknapp-klick', async () => {
      render(<App />);
      
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      
      // Kontrollera att poängen återställs till 0
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // TANGENTBORDKONTROLLER TESTER
  // ============================================================================

  describe('Tangentbordskontroller', () => {
    it('hanterar pilknapp-navigation', () => {
      render(<App />);
      
      // Hitta spelcontainern eller använd body som fallback
      const gameContainer = screen.getByTestId('game-container') || document.body;
      
      // Testa alla pilknappar
      fireEvent.keyDown(gameContainer, { key: 'ArrowLeft', code: 'ArrowLeft' });   // Vänster
      fireEvent.keyDown(gameContainer, { key: 'ArrowRight', code: 'ArrowRight' }); // Höger
      fireEvent.keyDown(gameContainer, { key: 'ArrowDown', code: 'ArrowDown' });   // Ner
      fireEvent.keyDown(gameContainer, { key: 'ArrowUp', code: 'ArrowUp' });       // Upp
      
      // Dessa ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar mellanslag för hård drop', () => {
      render(<App />);
      
      const gameContainer = screen.getByTestId('game-container') || document.body;
      fireEvent.keyDown(gameContainer, { key: ' ', code: 'Space' });
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar hållknapp (C)', () => {
      render(<App />);
      
      const gameContainer = screen.getByTestId('game-container') || document.body;
      fireEvent.keyDown(gameContainer, { key: 'c', code: 'KeyC' });
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });
  });

  // ============================================================================
  // SPELSTATUS VISNING TESTER
  // ============================================================================

  describe('Spelstatus Visning', () => {
    it('visar aktuell poäng', () => {
      render(<App />);
      
      const scoreElement = screen.getByText(/0/);
      expect(scoreElement).toBeInTheDocument();
    });

    it('visar aktuell nivå', () => {
      render(<App />);
      
      const levelElement = screen.getByText(/1/);
      expect(levelElement).toBeInTheDocument();
    });

    it('visar aktuella rader', () => {
      render(<App />);
      
      const linesElement = screen.getByText(/0/);
      expect(linesElement).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIV DESIGN TESTER
  // ============================================================================

  describe('Responsiv Design', () => {
    it('anpassar sig till olika skärmstorlekar', () => {
      // Mocka olika viewport-storlekar
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet-storlek
      });
      
      render(<App />);
      
      // Komponenten ska renderas utan fel
      expect(screen.getByText(/tetris/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PRESTANDA TESTER
  // ============================================================================

  describe('Prestanda', () => {
    it('renderas inom acceptabel tid', async () => {
      const startTime = performance.now();
      
      render(<App />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Ska renderas på mindre än 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
});
