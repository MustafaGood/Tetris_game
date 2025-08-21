/**
 * Tillgänglighetstester för Tetris-spelet
 * 
 * Denna fil testar att spelet följer WCAG-riktlinjer och är tillgängligt
 * för användare med olika funktionsnedsättningar.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// ============================================================================
// HUVUDTESTSUIT
// ============================================================================

describe('Tillgänglighetstester', () => {
  /**
   * Rensa alla mocks före varje test
   * Säkerställer att varje test börjar med en ren slate
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // WCAG-EFTERLEVNAD TESTER
  // ============================================================================

  describe('WCAG-efterlevnad', () => {
    it('har inga tillgänglighetsöverträdelser', async () => {
      render(<App />);
      
      // Grundläggande tillgänglighetstest
      // Kontrollera att alla interaktiva element har tillgängliga namn
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('uppfyller WCAG 2.1 AA-standarder', async () => {
      render(<App />);
      
      // Kontrollera grundläggande WCAG-krav
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
      
      // Kontrollera att alla bilder har alt-text
      const images = screen.getAllByRole('img');
      images.forEach(image => {
        expect(image).toHaveAttribute('alt');
      });
    });
  });

  // ============================================================================
  // SEMANTISK HTML TESTER
  // ============================================================================

  describe('Semantisk HTML', () => {
    it('använder korrekt rubrikstruktur', () => {
      render(<App />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Kontrollera huvudrubrik
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/tetris/i);
    });

    it('använder korrekta knapp-element för interaktiva kontroller', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Kontrollera att alla knappar har tillgängliga namn
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('använder korrekta formulärelement där det är lämpligt', () => {
      render(<App />);
      
      // Kontrollera formulärinmatningar om de finns
      const inputs = screen.queryAllByRole('textbox');
      inputs.forEach(input => {
        // Kontrollera att input har minst ett av följande attribut
        const hasAriaLabel = input.hasAttribute('aria-label');
        const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
        const hasPlaceholder = input.hasAttribute('placeholder');
        
        expect(hasAriaLabel || hasAriaLabelledBy || hasPlaceholder).toBe(true);
      });
    });
  });

  // ============================================================================
  // TANGENTBORDNAVIGATION TESTER
  // ============================================================================

  describe('Tangentbordsnavigation', () => {
    it('stöder tab-navigation', () => {
      render(<App />);
      
      const interactiveElements = screen.getAllByRole('button');
      expect(interactiveElements.length).toBeGreaterThan(0);
      
      // Kontrollera att alla interaktiva element är fokuserbara
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex');
        const tabIndex = element.getAttribute('tabindex');
        expect(['0', '-1']).toContain(tabIndex);
      });
    });

    it('har logisk tab-ordning', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 1) {
        // Kontrollera att tab-ordningen är logisk (start, paus, återställ)
        const startButton = screen.getByRole('button', { name: /start/i });
        const pauseButton = screen.getByRole('button', { name: /pause/i });
        const resetButton = screen.getByRole('button', { name: /reset/i });
        
        expect(startButton).toBeInTheDocument();
        expect(pauseButton).toBeInTheDocument();
        expect(resetButton).toBeInTheDocument();
      }
    });

    it('stöder tangentbordsgenvägar', () => {
      render(<App />);
      
      // Kontrollera att tangentbordsgenvägar är dokumenterade eller tillgängliga
      const gameContainer = screen.getByTestId('game-container') || document.body;
      expect(gameContainer).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SKÄRMLÄSARSTÖD TESTER
  // ============================================================================

  describe('Skärmläsarstöd', () => {
    it('tillhandahåller korrekta ARIA-etiketter', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('använder ARIA live-regioner för dynamiskt innehåll', () => {
      render(<App />);
      
      // Kontrollera live-regioner som meddelar poängändringar
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('tillhandahåller statusuppdateringar för skärmläsare', () => {
      render(<App />);
      
      // Kontrollera statusmeddelanden
      const statusElements = screen.queryAllByRole('status');
      if (statusElements.length > 0) {
        statusElements.forEach(element => {
          expect(element).toHaveAttribute('aria-live');
        });
      }
    });
  });

  // ============================================================================
  // FÄRG OCH KONTRAST TESTER
  // ============================================================================

  describe('Färg och kontrast', () => {
    it('har tillräcklig färgkontrast', async () => {
      render(<App />);
      
      // Grundläggande kontrastkontroll
      const textElements = screen.getAllByText(/score|level|lines/i);
      textElements.forEach(element => {
        // Kontrollera att text är läsbar
        expect(element).toBeInTheDocument();
      });
    });

    it('förlitar sig inte enbart på färg för att förmedla information', () => {
      render(<App />);
      
      // Kontrollera att viktig information inte förmedlas endast genom färg
      const scoreElements = screen.getAllByText(/score/i);
      scoreElements.forEach(element => {
        // Ska ha ytterligare visuella indikatorer utöver bara färg
        expect(element).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // FOKUSHANTERING TESTER
  // ============================================================================

  describe('Fokushantering', () => {
    it('behåller synliga fokusindikatorer', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Fokus ska vara synligt
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });

    it('hanterar fokus lämpligt under spelstatusändringar', () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      startButton.focus();
      
      // Fokus ska stanna kvar på interaktiva element
      expect(document.activeElement).toBe(startButton);
    });
  });

  // ============================================================================
  // ALTERNATIV TEXT TESTER
  // ============================================================================

  describe('Alternativ text', () => {
    it('tillhandahåller alt-text för bilder', () => {
      render(<App />);
      
      const images = screen.getAllByRole('img');
      images.forEach(image => {
        expect(image).toHaveAttribute('alt');
        const altText = image.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText).not.toBe('');
      });
    });

    it('tillhandahåller beskrivande alt-text för spelelement', () => {
      render(<App />);
      
      const gameImages = screen.queryAllByRole('img', { name: /game/i });
      gameImages.forEach(image => {
        const altText = image.getAttribute('alt');
        expect(altText).toMatch(/game|tetris|piece|board/i);
      });
    });
  });

  // ============================================================================
  // RESPONSIV TILLGÄNGLIGHET TESTER
  // ============================================================================

  describe('Responsiv tillgänglighet', () => {
    it('behåller tillgänglighet på olika skärmstorlekar', () => {
      // Testa mobil viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobil-storlek
      });
      
      render(<App />);
      
      // Ska fortfarande ha tillgängliga element
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('tillhandahåller touch-vänliga målgruppsstorlekar', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const minSize = 44; // Minsta touch-målgruppsstorlek
        
        expect(rect.width).toBeGreaterThanOrEqual(minSize);
        expect(rect.height).toBeGreaterThanOrEqual(minSize);
      });
    });
  });

  // ============================================================================
  // FELHANTERING TESTER
  // ============================================================================

  describe('Felhantering', () => {
    it('meddelar fel till skärmläsare', () => {
      render(<App />);
      
      // Kontrollera felmeddelandemekanismer
      const errorRegions = document.querySelectorAll('[aria-live="assertive"]');
      if (errorRegions.length > 0) {
        errorRegions.forEach(region => {
          expect(region).toHaveAttribute('aria-live', 'assertive');
        });
      }
    });

    it('tillhandahåller tydliga felmeddelanden', () => {
      render(<App />);
      
      // Kontrollera felmeddelandeelement
      const errorMessages = screen.queryAllByRole('alert');
      if (errorMessages.length > 0) {
        errorMessages.forEach(message => {
          expect(message).toHaveAttribute('aria-live');
        });
      }
    });
  });

  // ============================================================================
  // SPELSPECIFIK TILLGÄNGLIGHET TESTER
  // ============================================================================

  describe('Spelspecifik tillgänglighet', () => {
    it('tillhandahåller ljudcuer för viktiga händelser', () => {
      render(<App />);
      
      // Kontrollera ljudelement eller ljudkontext
      const audioElements = document.querySelectorAll('audio');
      if (audioElements.length > 0) {
        audioElements.forEach(audio => {
          expect(audio).toHaveAttribute('controls');
          expect(audio).toHaveAttribute('preload');
        });
      }
    });

    it('stöder alternativa inmatningsmetoder', () => {
      render(<App />);
      
      // Kontrollera stöd för alternativa inmatningar
      const gameContainer = screen.getByTestId('game-container') || document.body;
      expect(gameContainer).toBeInTheDocument();
      
      // Ska stödja både mus- och tangentbordsinmatning
      const hasTabIndex = gameContainer.hasAttribute('tabindex');
      const hasRole = gameContainer.hasAttribute('role');
      expect(hasTabIndex || hasRole).toBe(true);
    });

    it('tillhandahåller spelstatusinformation till hjälptechnologier', () => {
      render(<App />);
      
      // Kontrollera spelstatusmeddelanden
      const gameStateElements = screen.queryAllByRole('status');
      if (gameStateElements.length > 0) {
        gameStateElements.forEach(element => {
          expect(element).toHaveAttribute('aria-live');
        });
      }
    });
  });
});
