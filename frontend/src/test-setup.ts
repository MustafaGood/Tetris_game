/**
 * Test Setup för Tetris Spel
 * 
 * Denna fil konfigurerar alla nödvändiga mocks och globala objekt
 * som behövs för att köra tester i en Node.js miljö istället för en webbläsare.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// ============================================================================
// MOCK AV WEBBLÄSAR-API:ER
// ============================================================================

/**
 * Mock av ResizeObserver - används för att övervaka elementstorleksändringar
 * Detta behövs eftersom ResizeObserver inte finns tillgängligt i Node.js
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),        // Börjar övervaka ett element
  unobserve: vi.fn(),      // Slutar övervaka ett element
  disconnect: vi.fn(),     // Kopplar från alla observationer
}));

/**
 * Mock av requestAnimationFrame - simulerar webbläsarens animation loop
 * Används för att hantera spel-animationer i testerna
 */
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

/**
 * Mock av Canvas Context - simulerar HTML5 Canvas API
 * Detta är viktigt eftersom Tetris-spelet använder canvas för rendering
 */
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
  if (contextId === '2d') {
    return {
      // Grundläggande ritfunktioner
      fillRect: vi.fn(),           // Rita fylld rektangel
      clearRect: vi.fn(),          // Rensa rektangelområde
      getImageData: vi.fn(() => ({ data: new Array(4) })), // Hämta bilddata
      putImageData: vi.fn(),       // Placera bilddata
      
      // Bildhantering
      createImageData: vi.fn(() => []), // Skapa ny bilddata
      
      // Transformationsfunktioner
      setTransform: vi.fn(),       // Sätt transformation
      translate: vi.fn(),          // Flytta origo
      scale: vi.fn(),              // Skala
      rotate: vi.fn(),             // Rotera
      transform: vi.fn(),          // Applicera transformation
      
      // Ritfunktioner
      drawImage: vi.fn(),          // Rita bild
      fillText: vi.fn(),           // Rita fylld text
      measureText: vi.fn(() => ({ width: 0 })), // Mät textbredd
      
      // Sökvägsfunktioner
      beginPath: vi.fn(),          // Börja ny sökväg
      moveTo: vi.fn(),             // Flytta till punkt
      lineTo: vi.fn(),             // Rita linje till punkt
      closePath: vi.fn(),          // Stäng sökväg
      arc: vi.fn(),                // Rita båge
      rect: vi.fn(),               // Rita rektangel
      
      // Rendering
      stroke: vi.fn(),             // Rita sökväg
      fill: vi.fn(),               // Fyll sökväg
      clip: vi.fn(),               // Klipp till sökväg
      
      // Tillståndshantering
      save: vi.fn(),               // Spara tillstånd
      restore: vi.fn(),            // Återställ tillstånd
    } as any; // Använd 'any' för att undvika TypeScript-fel i testmiljön
  }
  return null;
});

// ============================================================================
// MOCK AV LOKAL LAGRING
// ============================================================================

/**
 * Mock av localStorage - simulerar webbläsarens lokal lagring
 * Används för att spara spelinställningar och high scores
 */
const localStorageMock = {
  getItem: vi.fn(),            // Hämta värde från lagring
  setItem: vi.fn(),            // Sätt värde i lagring
  removeItem: vi.fn(),         // Ta bort värde från lagring
  clear: vi.fn(),              // Rensa all lagring
};
global.localStorage = localStorageMock;

/**
 * Mock av sessionStorage - simulerar webbläsarens sessionslagring
 * Används för temporär data under spel session
 */
const sessionStorageMock = {
  getItem: vi.fn(),            // Hämta värde från sessionslagring
  setItem: vi.fn(),            // Sätt värde i sessionslagring
  removeItem: vi.fn(),         // Ta bort värde från sessionslagring
  clear: vi.fn(),              // Rensa all sessionslagring
};
global.sessionStorage = sessionStorageMock;

// ============================================================================
// MOCK AV PERFORMANCE API
// ============================================================================

/**
 * Mock av Performance API - simulerar webbläsarens prestandamätning
 * Används för att mäta spelprestanda och optimering
 */
global.performance = {
  now: vi.fn(() => Date.now()),           // Hämta aktuell tid i millisekunder
  mark: vi.fn(),                          // Skapa prestandamarkering
  measure: vi.fn(),                       // Mät tid mellan markeringar
  getEntriesByType: vi.fn(() => []),      // Hämta prestanda poster efter typ
  getEntriesByName: vi.fn(() => []),      // Hämta prestanda poster efter namn
  clearMarks: vi.fn(),                    // Rensa alla markeringar
  clearMeasures: vi.fn(),                 // Rensa alla mätningar
  timeOrigin: Date.now(),                 // Tidpunkt när sidan laddades
} as Performance;

// ============================================================================
// MOCK AV INTERSECTION OBSERVER
// ============================================================================

/**
 * Mock av IntersectionObserver - används för att övervaka synlighet
 * Detta behövs för komponenter som ska animeras när de blir synliga
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),            // Börja övervaka element
  unobserve: vi.fn(),          // Sluta övervaka element
  disconnect: vi.fn(),         // Koppla från alla observationer
}));

// ============================================================================
// KONSOLLHANTERING FÖR TESTER
// ============================================================================

/**
 * Hantering av konsolloggar under tester
 * 
 * Vi undertrycker vissa förväntade felmeddelanden som inte är relevanta
 * för våra tester, men låter andra felmeddelanden visas för debugging
 */
const originalError = console.error;

/**
 * Setup som körs före alla tester
 * Konfigurerar konsolloggar för att filtrera bort irrelevanta varningar
 */
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Filtrera bort React 18 varningar som inte påverkar våra tester
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return; // Ignorera denna specifika varning
    }
    
    // Visa alla andra felmeddelanden för debugging
    originalError.call(console, ...args);
  };
});

/**
 * Cleanup som körs efter alla tester
 * Återställer konsolloggar till ursprungligt tillstånd
 */
afterAll(() => {
  console.error = originalError;
});

// ============================================================================
// EXPORT AV MOCKS FÖR ANVÄNDNING I ANDRA TESTFILER
// ============================================================================

export {
  localStorageMock,
  sessionStorageMock,
};
