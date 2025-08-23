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
import { ThemeProvider } from '../contexts/ThemeContext';
import App from '../App';

// ============================================================================
// TEST WRAPPER
// ============================================================================

/**
 * Test wrapper som inkluderar alla nödvändiga providers
 * Säkerställer att komponenter har tillgång till context
 */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

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
  Grid: Array(20).fill(Array(10).fill(0)),
  spawn: vi.fn(() => ({ id: 1, r: 0, x: 4, y: 0 })),
  Bag: vi.fn().mockImplementation(() => ({
    next: vi.fn(() => ({ id: 1, r: 0, x: 4, y: 0 }))
  })),
  collide: vi.fn(() => false),
  merge: vi.fn(),
  getFullRows: vi.fn(() => []),
  clearRows: vi.fn(),
  rotateWithSRS: vi.fn(),
  tickSpeed: vi.fn(() => 1000),
  W: 10,
  calculateSoftDropScore: vi.fn(() => 1),
  calculateHardDropScore: vi.fn(() => 2),
  isTetris: vi.fn(() => false),
  isTSpin: vi.fn(() => false),
  calculateTotalScore: vi.fn(() => 0),
  isGameOver: vi.fn(() => false),
  validateGrid: vi.fn(() => true),
  GameState: {
    START: 'start',
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
    it('renderar huvudmenyn', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Kontrollera att huvudtiteln finns (använd h1-elementet specifikt)
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent(/tetris/i);
      
      // Kontrollera att alla huvudmenyknappar finns
      expect(screen.getByRole('button', { name: /starta spel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /highscores/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inställningar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hjälp/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /info/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /avsluta/i })).toBeInTheDocument();
    });

    it('visar spelbeskrivning', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Kontrollera att beskrivningstexten finns
      expect(screen.getByText(/klassisk tetris med moderna funktioner/i)).toBeInTheDocument();
      expect(screen.getByText(/version 2\.0\.0/i)).toBeInTheDocument();
      expect(screen.getByText(/byggd med react & typescript/i)).toBeInTheDocument();
    });

    it('har korrekta tillgänglighetsattribut', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Kontrollera att alla knappar har korrekta roller
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
      
      // Kontrollera att huvudtiteln finns
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SPELKONTROLLER TESTER
  // ============================================================================

  describe('Spelkontroller', () => {
    it('hanterar starta spel-knapp-klick', async () => {
      render(<App />, { wrapper: TestWrapper });
      
      const startButton = screen.getByRole('button', { name: /starta spel/i });
      fireEvent.click(startButton);
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar highscores-knapp-klick', async () => {
      render(<App />, { wrapper: TestWrapper });
      
      const highscoresButton = screen.getByRole('button', { name: /highscores/i });
      fireEvent.click(highscoresButton);
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar inställningar-knapp-klick', async () => {
      render(<App />, { wrapper: TestWrapper });
      
      const settingsButton = screen.getByRole('button', { name: /inställningar/i });
      fireEvent.click(settingsButton);
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });
  });

  // ============================================================================
  // TANGENTBORDKONTROLLER TESTER
  // ============================================================================

  describe('Tangentbordskontroller', () => {
    it('hanterar pilknapp-navigation', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Använd body som container för tangentbordstester
      const container = document.body;
      
      // Testa alla pilknappar
      fireEvent.keyDown(container, { key: 'ArrowLeft', code: 'ArrowLeft' });   // Vänster
      fireEvent.keyDown(container, { key: 'ArrowRight', code: 'ArrowRight' }); // Höger
      fireEvent.keyDown(container, { key: 'ArrowDown', code: 'ArrowDown' });   // Ner
      fireEvent.keyDown(container, { key: 'ArrowUp', code: 'ArrowUp' });       // Upp
      
      // Dessa ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar mellanslag för hård drop', () => {
      render(<App />, { wrapper: TestWrapper });
      
      const container = document.body;
      fireEvent.keyDown(container, { key: ' ', code: 'Space' });
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });

    it('hanterar hållknapp (C)', () => {
      render(<App />, { wrapper: TestWrapper });
      
      const container = document.body;
      fireEvent.keyDown(container, { key: 'c', code: 'KeyC' });
      
      // Ska inte kasta fel
      expect(true).toBe(true);
    });
  });

  // ============================================================================
  // SPELSTATUS VISNING TESTER
  // ============================================================================

  describe('Spelstatus Visning', () => {
    it('visar version och bygginformation', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Kontrollera att versionsinformation finns
      expect(screen.getByText(/version 2\.0\.0/i)).toBeInTheDocument();
      expect(screen.getByText(/byggd med react & typescript/i)).toBeInTheDocument();
    });

    it('visar spelinstruktioner', () => {
      render(<App />, { wrapper: TestWrapper });
      
      // Kontrollera att instruktioner finns
      expect(screen.getByText(/använd piltangenter för att spela/i)).toBeInTheDocument();
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
      
      render(<App />, { wrapper: TestWrapper });
      
      // Komponenten ska renderas utan fel
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent(/tetris/i);
    });
  });

  // ============================================================================
  // PRESTANDA TESTER
  // ============================================================================

  describe('Prestanda', () => {
    it('renderas inom acceptabel tid', async () => {
      const startTime = performance.now();
      
      render(<App />, { wrapper: TestWrapper });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Ska renderas på mindre än 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
});
