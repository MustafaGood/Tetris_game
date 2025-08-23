/**
 * Jest-konfiguration för Tetris Backend
 * 
 * Denna fil konfigurerar Jest-testmiljön för backend-projektet
 * med kodtäckning, timeout-inställningar och testmappar.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 */

export default {
  // ============================================================================
  // GRUNDLÄGGANDE INSTÄLLNINGAR
  // ============================================================================
  
  testEnvironment: 'node',     // Testmiljö för Node.js
  
  // ============================================================================
  // KODTÄCKNING KONFIGURATION
  // ============================================================================
  
  collectCoverageFrom: [
    '**/*.{js,ts}',            // Samla täckning från alla JS/TS-filer
    '!**/node_modules/**',     // Exkludera node_modules
    '!**/coverage/**',         // Exkludera täckningsrapporter
    '!**/dist/**',             // Exkludera byggmappar
    '!**/build/**',            // Exkludera byggmappar
    '!**/*.config.js',         // Exkludera konfigurationsfiler
    '!**/jest.config.js',      // Exkludera denna fil
    '!**/test-*.js',           // Exkludera test-hjälpfiler
    '!**/scripts/**'           // Exkludera skriptmappar
  ],
  
  coverageDirectory: 'coverage', // Mapp för täckningsrapporter
  
  coverageReporters: [
    'text',                     // Konsolutskrift
    'lcov',                    // LCOV-format för CI/CD
    'html',                    // HTML-rapport för webbläsare
    'json'                     // JSON-format för analys
  ],
  
  // ============================================================================
  // TÄCKNINGSGRÄNSER
  // ============================================================================
  
  coverageThreshold: {
    global: {
      branches: 80,            // Minst 80% gren-täckning
      functions: 80,           // Minst 80% funktion-täckning
      lines: 80,               // Minst 80% rad-täckning
      statements: 80           // Minst 80% sats-täckning
    }
  },
  
  // ============================================================================
  // TESTFILER OCH TIMEOUT
  // ============================================================================
  
  testMatch: [
    '**/__tests__/**/*.{js,ts}',      // Testfiler i __tests__-mappar
    '**/?(*.)+(spec|test).{js,ts}'   // Testfiler med spec/test-suffix
  ],
  
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setup.js'   // Exclude setup file from tests
  ],
  
  testTimeout: 10000,          // 10 sekunder timeout per test
  
  // ============================================================================
  // SETUP OCH MOCK-HANTERING
  // ============================================================================
  
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'], // Setup-fil efter miljö
  
  // ============================================================================
  // UTSKRIFTS- OCH FELSÖKNINGSINSTÄLLNINGAR
  // ============================================================================
  
  verbose: true,                // Detaljerad utskrift av tester
  forceExit: true,              // Tvinga avslut efter tester
  clearMocks: true,             // Rensa mocks mellan tester
  resetMocks: true,             // Återställ mocks mellan tester
  restoreMocks: true            // Återställ mocks till ursprungligt tillstånd
};
