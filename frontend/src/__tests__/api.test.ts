// Testverktyg och API-funktioner import
// Kommentarer på svenska för att förklara vad testen gör
import { 
  fetchScores, 
  postScore, 
  deleteScore, 
  getGameSeed, 
  validateScore, 
  testConnection,
  formatDate,
  formatScore,
  isGameSeedExpired,
  getGameSeedTimeLeft
} from '../api';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mockar fetch-funktionen så testerna inte gör riktiga nätverksförfrågningar
const mockFetch = vi.fn();

// Ersätter global fetch med vår mock
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true
});

describe('API Tests', () => {
  // Rensar alla mockar innan varje test så vi får en ren testmiljö
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Testgrupp: fetchScores - hämtar topplista från servern
  describe('fetchScores', () => {
    // Test: lyckas hämta poänglista från servern
    test('should fetch scores successfully', async () => {
      // Mockade poängdata som servern skulle returnera
      const mockScores = [
        { _id: '1', name: 'Player1', points: 1000, level: 5, lines: 20, createdAt: '2024-01-01T10:00:00Z' },
        { _id: '2', name: 'Player2', points: 2000, level: 8, lines: 30, createdAt: '2024-01-01T11:00:00Z' }
      ];

      // Simulerar ett lyckat API-anrop
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScores
      });

      const result = await fetchScores(10);

      // Kontrollerar att rätt URL anropades med rätt parameter
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/scores/top?limit=10', expect.objectContaining({}));
      // Kontrollerar att resultatet normaliseras korrekt (lägger till id-fält)
      expect(result).toEqual([
        { _id: '1', id: '1', name: 'Player1', points: 1000, level: 5, lines: 20, createdAt: '2024-01-01T10:00:00Z' },
        { _id: '2', id: '2', name: 'Player2', points: 2000, level: 8, lines: 30, createdAt: '2024-01-01T11:00:00Z' }
      ]);
    });

    // Test: hanterar nätverksfel elegant utan att krascha
    test('should handle fetch error gracefully', async () => {
      // Simulerar ett nätverksfel
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchScores(10);

      // Förväntar att funktionen returnerar tom array istället för att krascha
      expect(result).toEqual([]);
    });

    // Test: normaliserar både MongoDB (_id) och SQLite (id) ID-format
    test('should normalize both MongoDB and SQLite IDs', async () => {
      // Mockade data med olika ID-format
      const mockScores = [
        { _id: 'mongo-id', name: 'Player1', points: 1000, level: 5, lines: 20, createdAt: '2024-01-01T10:00:00Z' },
        { id: 123, name: 'Player2', points: 2000, level: 8, lines: 30, createdAt: '2024-01-01T11:00:00Z' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScores
      });

      const result = await fetchScores(10);

      // Kontrollerar att båda ID-typerna hanteras korrekt
      expect(result[0].id).toBe('mongo-id');
      expect(result[1].id).toBe(123);
    });
  });

  // Testgrupp: postScore - skickar poäng till servern
  describe('postScore', () => {
    // Test: lyckas skicka poäng till servern
    test('should post score successfully', async () => {
      // Mockat svar från servern vid lyckad poänginlämning
      const mockResponse = {
        ok: true,
        id: 'new-score-id',
        message: 'Score saved successfully',
        expectedScore: 1500
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Testdata som skickas till servern
      const scoreData = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const result = await postScore(scoreData);

      // Kontrollerar att rätt HTTP-metod och data skickades
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/scores', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(scoreData)
      }));
      // Kontrollerar att resultatet formateras korrekt
      expect(result).toEqual({
        success: true,
        data: {
          id: 'new-score-id',
          message: 'Score saved successfully',
          expectedScore: 1500
        }
      });
    });

    // Test: hanterar valideringsfel från servern
    test('should handle validation error', async () => {
      // Mockat felmeddelande från servern
      const mockError = {
        error: 'Score validation failed',
        reason: 'Score too high',
        expectedScore: 1500
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });

      // Testdata med misstänkt hög poäng
      const scoreData = {
        name: 'TestPlayer',
        points: 999999,
        level: 1,
        lines: 5
      };

      const result = await postScore(scoreData);

      // Förväntar att felmeddelandet hanteras korrekt
      expect(result).toEqual({
        success: false,
        error: 'Score validation failed'
      });
    });

    // Test: hanterar nätverksfel vid poänginlämning
    test('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const scoreData = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20
      };

      const result = await postScore(scoreData);

      // Förväntar att nätverksfel hanteras utan att krascha
      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  // Testgrupp: deleteScore - raderar poäng från servern
  describe('deleteScore', () => {
    // Test: lyckas radera poäng från servern
    test('should delete score successfully', async () => {
      // Mockat svar från servern vid lyckad radering
      const mockResponse = {
        ok: true,
        deleted: 1,
        message: 'Score deleted successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deleteScore('score-id');

      // Kontrollerar att DELETE-anropet gjordes till rätt URL
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/scores/score-id', expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      }));
      // Kontrollerar att resultatet innehåller rätt information
      expect(result).toEqual({
        success: true,
        data: {
          deleted: 1,
          message: 'Score deleted successfully'
        }
      });
    });

    // Test: hanterar fel när poängen inte hittas
    test('should handle delete error', async () => {
      // Mockat felmeddelande från servern
      const mockError = {
        error: 'Score not found'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });

      const result = await deleteScore('non-existent-id');

      // Förväntar att felmeddelandet hanteras korrekt
      expect(result).toEqual({
        success: false,
        error: 'Score not found'
      });
    });
  });

  // Testgrupp: getGameSeed - hämtar spel-seed från servern
  describe('getGameSeed', () => {
    // Test: lyckas hämta spel-seed från servern
    test('should get game seed successfully', async () => {
      // Mockat seed-data från servern
      const mockSeed = {
        seed: 'a1b2c3d4e5f67890',
        timestamp: 1640995200000,
        expiresAt: 1640995500000
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeed
      });

      const result = await getGameSeed();

      // Kontrollerar att rätt endpoint anropades
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/game/seed', expect.objectContaining({}));
      // Kontrollerar att seed-data returneras oförändrat
      expect(result).toEqual(mockSeed);
    });

    // Test: hanterar fel vid hämtning av seed
    test('should handle seed fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getGameSeed();

      // Förväntar att null returneras vid fel
      expect(result).toBeNull();
    });
  });

  // Testgrupp: validateScore - validerar poäng på servern
  describe('validateScore', () => {
    // Test: lyckas validera poäng på servern
    test('should validate score successfully', async () => {
      // Mockat valideringsresultat från servern
      const mockValidation = {
        isValid: true,
        expectedScore: 1500
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidation
      });

      // Testdata som ska valideras
      const scoreData = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const result = await validateScore(scoreData);

      // Kontrollerar att validerings-endpoint anropades med rätt data
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/scores/validate', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(scoreData)
      }));
      // Kontrollerar att valideringsresultatet returneras
      expect(result).toEqual(mockValidation);
    });

    // Test: hanterar valideringsfel från servern
    test('should handle validation error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Validation failed'));

      const scoreData = {
        name: 'TestPlayer',
        points: 999999,
        level: 1,
        lines: 5
      };

      const result = await validateScore(scoreData);

      // Förväntar att felmeddelandet hanteras korrekt
      expect(result).toEqual({
        isValid: false,
        reason: 'Validation failed'
      });
    });
  });

  // Testgrupp: testConnection - testar anslutning till servern
  describe('testConnection', () => {
    // Test: returnerar true vid lyckad anslutning
    test('should return true for successful connection', async () => {
      // Mockat hälsosvar från servern
      const mockHealth = {
        ok: true,
        db: 'connected',
        timestamp: '2024-01-01T10:00:00Z',
        uptime: 123.45,
        version: '2.0.0',
        environment: 'production'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth
      });

      const result = await testConnection();

      // Kontrollerar att health-endpoint anropades med rätt headers
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/health', expect.objectContaining({
        method: 'GET',
        mode: 'cors',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      }));
      // Förväntar att true returneras vid lyckad anslutning
      expect(result).toBe(true);
    });

    // Test: returnerar false vid rate limiting
    test('should return false for rate limited response', async () => {
      // Simulerar rate limiting (429 Too Many Requests)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const result = await testConnection();

      // Förväntar att false returneras vid rate limiting
      expect(result).toBe(false);
    });

    // Test: returnerar false vid nätverksfel
    test('should return false for network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await testConnection();

      // Förväntar att false returneras vid nätverksfel
      expect(result).toBe(false);
    });
  });

  // Testgrupp: Hjälpfunktioner för formatering och validering
  describe('Utility Functions', () => {
    // Testgrupp: formatDate - formaterar datum till läsbart format
    describe('formatDate', () => {
      // Test: formaterar datum korrekt till svenskt format
      test('should format date correctly', () => {
        const dateString = '2024-01-01T10:30:00Z';
        const result = formatDate(dateString);
        
        // Kontrollerar att resultatet matchar svenskt datumformat (t.ex. "1 jan. 2024 11:30")
        expect(result).toMatch(/\d{1,2}\s\w{3}\.\s\d{4}\s\d{2}:\d{2}/);
      });

      // Test: hanterar ogiltigt datum utan att krascha
      test('should handle invalid date', () => {
        const result = formatDate('invalid-date');
        // Förväntar att ogiltigt datum returneras som "Invalid Date"
        expect(result).toBe('Invalid Date');
      });
    });

    // Testgrupp: formatScore - formaterar poäng med tusentalsavgränsare
    describe('formatScore', () => {
      // Test: lägger till tusentalsavgränsare (mellanslag) i poäng
      test('should format score with thousands separator', () => {
        // formatScore använder svenskt format med icke-brytande mellanslag (U+00A0)
        expect(formatScore(1000)).toBe('1\u00A0000');
        expect(formatScore(1234567)).toBe('1\u00A0234\u00A0567');
        expect(formatScore(0)).toBe('0');
      });
    });

    // Testgrupp: isGameSeedExpired - kontrollerar om spel-seed har gått ut
    describe('isGameSeedExpired', () => {
      // Test: returnerar true för utgånget seed
      test('should return true for expired seed', () => {
        // Skapar ett seed som gick ut för 10 minuter sedan
        const expiredSeed = {
          seed: 'a1b2c3d4e5f67890',
          timestamp: Date.now() - 600000, // 10 minuter sedan
          expiresAt: Date.now() - 300000  // 5 minuter sedan
        };

        expect(isGameSeedExpired(expiredSeed)).toBe(true);
      });

      // Test: returnerar false för giltigt seed
      test('should return false for valid seed', () => {
        // Skapar ett seed som är giltigt i 5 minuter till
        const validSeed = {
          seed: 'a1b2c3d4e5f67890',
          timestamp: Date.now(),
          expiresAt: Date.now() + 300000 // 5 minuter framåt
        };

        expect(isGameSeedExpired(validSeed)).toBe(false);
      });
    });

    // Testgrupp: getGameSeedTimeLeft - beräknar återstående tid för seed
    describe('getGameSeedTimeLeft', () => {
      // Test: returnerar återstående tid i millisekunder
      test('should return time left in milliseconds', () => {
        // Skapar ett seed som är giltigt i 1 minut till
        const seed = {
          seed: 'a1b2c3d4e5f67890',
          timestamp: Date.now(),
          expiresAt: Date.now() + 60000 // 1 minut framåt
        };

        const timeLeft = getGameSeedTimeLeft(seed);
        
        // Kontrollerar att återstående tid är positiv och rimlig
        expect(timeLeft).toBeGreaterThan(0);
        expect(timeLeft).toBeLessThanOrEqual(60000);
      });

      // Test: returnerar 0 för utgånget seed
      test('should return 0 for expired seed', () => {
        // Skapar ett seed som gick ut för 10 minuter sedan
        const expiredSeed = {
          seed: 'a1b2c3d4e5f67890',
          timestamp: Date.now() - 600000, // 10 minuter sedan
          expiresAt: Date.now() - 300000  // 5 minuter sedan
        };

        expect(getGameSeedTimeLeft(expiredSeed)).toBe(0);
      });
    });
  });

  // Testgrupp: Felhantering - hur API:et hanterar olika typer av fel
  describe('Error Handling', () => {
    // Test: hanterar ogiltigt JSON-svar från servern
    test('should handle malformed JSON response', async () => {
      // Simulerar ett 400 Bad Request svar
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' })
      });

      const result = await postScore({
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20
      });

      // Kontrollerar att felmeddelandet extraheras korrekt
      expect(result.success).toBe(false);
      expect(result.error).toBe('Bad Request');
    });

    // Test: hanterar svar utan felmeddelande
    test('should handle missing error message', async () => {
      // Simulerar ett 500 Internal Server Error utan felmeddelande
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      const result = await postScore({
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20
      });

      // Kontrollerar att standardfelmeddelande används
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/HTTP 500:/);
    });
  });
});
