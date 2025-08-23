/**
 * Test Setup för Tetris Backend
 * 
 * Denna fil konfigurerar alla nödvändiga mocks, globala objekt och testverktyg
 * som behövs för att köra backend-tester i en isolerad miljö.
 * 
 * @author Tetris Development Team
 * @version 1.0.0
 * 
 * NOTE: This file is NOT a test file - it's a setup file for Jest
 * Jest will automatically load this file before running tests
 */

// Jest globals are available automatically in test environment

// ============================================================================
// GLOBAL TEST SETUP OCH CLEANUP
// ============================================================================

/**
 * Setup som körs före alla tester
 * Konfigurerar testmiljön och undertrycker konsolloggar för renare testutskrifter
 */
beforeAll(() => {
  // Sätt testmiljö
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  
  // Mock konsolloggar för att minska brus i testerna
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

/**
 * Cleanup som körs efter alla tester
 * Återställer alla mocks till ursprungligt tillstånd
 */
afterAll(() => {
  jest.restoreAllMocks();
});

// ============================================================================
// PERFORMANCE API MOCK
// ============================================================================

/**
 * Mock av Performance API - simulerar webbläsarens prestandamätning
 * Används för att mäta testprestanda och exekveringstid
 */
global.performance = {
  now: jest.fn(() => Date.now()),           // Hämta aktuell tid i millisekunder
  mark: jest.fn(),                          // Skapa prestandamarkering
  measure: jest.fn(),                       // Mät tid mellan markeringar
  getEntriesByType: jest.fn(() => []),      // Hämta prestanda poster efter typ
  getEntriesByName: jest.fn(() => []),      // Hämta prestanda poster efter namn
  clearMarks: jest.fn(),                    // Rensa alla markeringar
  clearMeasures: jest.fn(),                 // Rensa alla mätningar
  timeOrigin: Date.now(),                   // Tidpunkt när testerna startade
};

// ============================================================================
// TESTVERKTYG OCH HJÄLPFUNKTIONER
// ============================================================================

/**
 * Globala testverktyg som kan användas i alla testfiler
 * Innehåller hjälpfunktioner för vanliga testuppgifter
 */
global.testUtils = {
  /**
   * Mät exekveringstid för en funktion
   * @param {Function} fn - Funktionen att mäta
   * @returns {Object} Objekt med resultat och exekveringstid
   */
  measureTime: async (fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { 
      result, 
      executionTime: end - start 
    };
  },
  
  /**
   * Skapa mock request-objekt för API-tester
   * @param {Object} overrides - Överskrivningar av standardvärden
   * @returns {Object} Mock request-objekt
   */
  createMockRequest: (overrides = {}) => ({
    body: {},        // Request body
    params: {},      // URL-parametrar
    query: {},       // Query-parametrar
    headers: {},     // HTTP-headers
    ...overrides     // Anpassade värden
  }),
  
  /**
   * Skapa mock response-objekt för API-tester
   * @returns {Object} Mock response-objekt med alla nödvändiga metoder
   */
  createMockResponse: () => {
    const res = {};
    
    // Mock av response-metoder med chaining-stöd
    res.status = jest.fn().mockReturnValue(res);  // Sätt HTTP-status
    res.json = jest.fn().mockReturnValue(res);    // Skicka JSON-svar
    res.send = jest.fn().mockReturnValue(res);    // Skicka svar
    res.end = jest.fn().mockReturnValue(res);     // Avsluta svar
    
    return res;
  },
  
  /**
   * Vänta ett visst antal millisekunder
   * Användbart för att simulera asynkrona operationer
   * @param {number} ms - Millisekunder att vänta
   * @returns {Promise} Promise som resolver efter väntetiden
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Generera testdata för poäng
   * @param {Object} overrides - Överskrivningar av standardvärden
   * @returns {Object} Testpoäng-objekt
   */
  generateTestScore: (overrides = {}) => ({
    name: 'TestPlayer',           // Spelarnamn
    points: 1000,                 // Poäng
    level: 5,                     // Spelnivå
    lines: 20,                    // Antal rader
    gameSeed: 'a1b2c3d4e5f67890', // Spel-seed för reproducerbarhet
    gameDuration: 120000,         // Speltid i millisekunder (2 minuter)
    ...overrides                  // Anpassade värden
  })
};

// ============================================================================
// DATABAS MOCK-VERKTYG
// ============================================================================

/**
 * Verktyg för att mocka databasanslutningar och frågor
 * Används för att isolera tester från riktig databas
 */
global.dbUtils = {
  /**
   * Mock av databasanslutning
   */
  mockConnection: {
    query: jest.fn(),    // Mock av SQL-frågor
    close: jest.fn()     // Mock av stängning av anslutning
  },
  
  /**
   * Skapa mock-resultat från databasfrågor
   * @param {Array|Object} data - Data att returnera
   * @returns {Object} Mock-query-resultat
   */
  mockQueryResult: (data) => ({
    rows: data,                                    // Rader från databasen
    rowCount: Array.isArray(data) ? data.length : 1  // Antal returnerade rader
  })
};

// ============================================================================
// RATE LIMITING TEST-VERKTYG
// ============================================================================

/**
 * Verktyg för att testa rate limiting-funktionalitet
 * Används för att simulera olika rate limiting-scenarier
 */
global.rateLimitUtils = {
  /**
   * Skapa mock av rate limiting-lagring
   * @returns {Object} Mock-store med alla nödvändiga metoder
   */
  createMockStore: () => ({
    incr: jest.fn(),        // Öka räknare för en nyckel
    decrement: jest.fn(),   // Minska räknare för en nyckel
    resetKey: jest.fn(),    // Återställ räknare för specifik nyckel
    resetAll: jest.fn()     // Återställ alla räknare
  })
};
// ============================================================================
// EXPORT AV VERKTYG FÖR ANVÄNDNING I ANDRA TESTFILER
// ============================================================================

// Export av verktyg för användning i andra testfiler
// Notera: Dessa är redan tillgängliga som globala objekt
// men kan importeras explicit om så önskas

