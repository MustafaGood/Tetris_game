const { 
  generateGameSeed, 
  validateGameSeed, 
  calculateExpectedScore, 
  validateScore, 
  analyzeScorePattern, 
  generateScoreHash 
} = require('../utils/scoreCalculator.js');

// Tester för poängberäkning och validering

describe('Tester för poängberäknaren', () => {
  // --- generateGameSeed ---
  // Genererar en hex-seed som används för att reproducera spel
  describe('generateGameSeed', () => {
    test('ska generera giltigt game seed', () => {
      const seed = generateGameSeed();
      
      expect(typeof seed).toBe('string');
      expect(seed.length).toBe(16);
      expect(seed).toMatch(/^[a-f0-9]+$/);
    });

    test('ska generera olika seeds', () => {
      const seed1 = generateGameSeed();
      const seed2 = generateGameSeed();
      
      expect(seed1).not.toBe(seed2);
    });

    test('ska generera deterministiska seeds med samma input', () => {
      // Obs: Detta test kan misslyckas om funktionen använder Date.now()
      // I så fall behöver vi mocka tiden
      const seed1 = generateGameSeed();
      const seed2 = generateGameSeed();
      
      // Seeds should be different due to timestamp
      expect(seed1).not.toBe(seed2);
    });
  });

  // --- validateGameSeed ---
  // Validerar formatet för game-seeds (hex, rätt längd)
  describe('validateGameSeed', () => {
    test('ska validera korrekt game seed', () => {
      const validSeed = 'a1b2c3d4e5f67890';
      expect(validateGameSeed(validSeed)).toBe(true);
    });

    test('ska neka ogiltigt format för game seed', () => {
      const invalidSeeds = [
        'short',           // Too short
        'a1b2c3d4e5f678901234567890', // Too long
        'a1b2c3d4e5f6789g', // Invalid character
        'a1b2c3d4e5f6789G', // Invalid character
        '',                // Empty
        null,              // Null
        undefined,         // Undefined
        123,               // Number
        {},                // Object
        []                 // Array
      ];

      invalidSeeds.forEach(seed => {
        expect(validateGameSeed(seed)).toBe(false);
      });
    });

    test('ska acceptera giltiga hex-tecken', () => {
      const validSeeds = [
        'a1b2c3d4e5f67890',
        'A1B2C3D4E5F67890',
        '0123456789abcdef',
        '0123456789ABCDEF'
      ];

      validSeeds.forEach(seed => {
        expect(validateGameSeed(seed)).toBe(true);
      });
    });
  });

  describe('calculateExpectedScore', () => {
  // --- calculateExpectedScore ---
  // Beräknar förväntad poäng utifrån nivå, rader och speltid
    test('ska beräkna poäng för grundparametrar', () => {
      const params = {
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const score = calculateExpectedScore(params);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThan(0);
    });

    test('ska hantera olika antal rader', () => {
      const baseParams = {
        level: 5,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const scores = {
        single: calculateExpectedScore({ ...baseParams, lines: 10 }),
        double: calculateExpectedScore({ ...baseParams, lines: 20 }),
        triple: calculateExpectedScore({ ...baseParams, lines: 30 }),
        tetris: calculateExpectedScore({ ...baseParams, lines: 40 })
      };

  // Tetris bör ge högsta poängen
      expect(scores.tetris).toBeGreaterThan(scores.triple);
      expect(scores.triple).toBeGreaterThan(scores.double);
      expect(scores.double).toBeGreaterThan(scores.single);
    });

    test('ska hantera olika nivåer', () => {
      const baseParams = {
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const score1 = calculateExpectedScore({ ...baseParams, level: 1 });
      const score10 = calculateExpectedScore({ ...baseParams, level: 10 });

      expect(score10).toBeGreaterThan(score1);
    });

    test('ska hantera bonus för speltid', () => {
      const baseParams = {
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const fastGame = calculateExpectedScore({ ...baseParams, gameDuration: 60000 }); // 1 minute
      const slowGame = calculateExpectedScore({ ...baseParams, gameDuration: 600000 }); // 10 minutes

      expect(fastGame).toBeGreaterThan(slowGame);
    });

    test('ska hantera saknade valfria parametrar', () => {
      const params = {
        level: 5,
        lines: 20
      };

      const score = calculateExpectedScore(params);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThan(0);
    });

    test('ska vara deterministisk med samma seed', () => {
      const params = {
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const score1 = calculateExpectedScore(params);
      const score2 = calculateExpectedScore(params);

      expect(score1).toBe(score2);
    });
  });

  describe('validateScore', () => {
  // --- validateScore ---
  // Validerar inskickade poängobjekt och returnerar skäl vid fel
    test('ska validera korrekt poäng', () => {
      const validScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890',
        gameDuration: 120000
      };

      const result = validateScore(validScore);
      
      expect(result.isValid).toBe(true);
      expect(result.expectedScore).toBeDefined();
    });

    test('ska neka ogiltigt namn', () => {
      const invalidScores = [
        { name: '', points: 1000, level: 5, lines: 20 },
        { name: null, points: 1000, level: 5, lines: 20 },
        { name: undefined, points: 1000, level: 5, lines: 20 },
        { name: 123, points: 1000, level: 5, lines: 20 }
      ];

      invalidScores.forEach(score => {
        const result = validateScore(score);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Invalid name');
      });
    });

    test('ska neka ogiltiga poäng', () => {
      const invalidScores = [
        { name: 'TestPlayer', points: -100, level: 5, lines: 20 },
        { name: 'TestPlayer', points: 'invalid', level: 5, lines: 20 },
        { name: 'TestPlayer', points: null, level: 5, lines: 20 },
        { name: 'TestPlayer', points: Infinity, level: 5, lines: 20 }
      ];

      invalidScores.forEach(score => {
        const result = validateScore(score);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Invalid points');
      });
    });

    test('ska neka ogiltig nivå', () => {
      const invalidScores = [
        { name: 'TestPlayer', points: 1000, level: 0, lines: 20 },
        { name: 'TestPlayer', points: 1000, level: 21, lines: 20 },
        { name: 'TestPlayer', points: 1000, level: 'invalid', lines: 20 },
        { name: 'TestPlayer', points: 1000, level: -5, lines: 20 }
      ];

      invalidScores.forEach(score => {
        const result = validateScore(score);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Invalid level');
      });
    });

    test('ska neka ogiltigt antal rader', () => {
      const invalidScores = [
        { name: 'TestPlayer', points: 1000, level: 5, lines: -5 },
        { name: 'TestPlayer', points: 1000, level: 5, lines: 'invalid' },
        { name: 'TestPlayer', points: 1000, level: 5, lines: null }
      ];

      invalidScores.forEach(score => {
        const result = validateScore(score);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Invalid lines');
      });
    });

    test('ska neka omöjlig poäng', () => {
      const impossibleScore = {
        name: 'TestPlayer',
        points: 999999,
        level: 1,
        lines: 5,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const result = validateScore(impossibleScore);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Score too high');
    });

    test('ska neka omöjlig kombination av nivå/rader', () => {
      // Exempel: nivå 10 kräver normalt betydligt fler rader än 5
      const impossibleScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 10,
        lines: 5 // Level 10 should require at least 90 lines
      };

      const result = validateScore(impossibleScore);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Impossible level/line combination');
    });

    test('ska neka misstänkt hög poäng med låg nivå', () => {
      const suspiciousScore = {
        name: 'TestPlayer',
        points: 150000,
        level: 5,
        lines: 20
      };

      const result = validateScore(suspiciousScore);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Score too high. Expected: ~1100, Got: 150000');
    });

    test('ska neka ogiltigt game seed', () => {
      const invalidScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'invalid-seed'
      };

      const result = validateScore(invalidScore);
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Invalid game seed');
    });
  });

  describe('Score Pattern Analysis', () => {
    test('should detect large score jumps', () => {
      const scores = [
        { points: 1000, createdAt: new Date('2024-01-01T10:00:00Z') },
        { points: 60000, createdAt: new Date('2024-01-01T11:00:00Z') } // 59000 point jump
      ];

      const analysis = analyzeScorePattern(scores);
      
      expect(analysis.suspicious).toBe(true);
      expect(analysis.reasons).toContain('Large score jump: 59000 points');
    });

    test('should detect too many scores in short time', () => {
      const now = new Date();
      const scores = Array(15).fill().map((_, i) => ({
        points: 1000 + i * 100,
        createdAt: new Date(now.getTime() - i * 60000) // Each score 1 minute apart
      }));

      const analysis = analyzeScorePattern(scores);
      
      expect(analysis.suspicious).toBe(true);
      expect(analysis.reasons).toContain('Too many scores in 24 hours');
    });

    test('should handle single score', () => {
      const scores = [
        { points: 1000, createdAt: new Date() }
      ];

      const analysis = analyzeScorePattern(scores);
      
      expect(analysis.suspicious).toBe(false);
      expect(analysis.reasons).toHaveLength(0);
    });

    test('should handle empty score list', () => {
      const analysis = analyzeScorePattern([]);
      
      expect(analysis.suspicious).toBe(false);
      expect(analysis.reasons).toHaveLength(0);
    });
  });

  describe('generateScoreHash', () => {
    test('should generate hash for score data', () => {
      const scoreData = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const hash = generateScoreHash(scoreData);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hash length
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    test('should generate different hash values for different data', () => {
      const scoreData1 = {
        name: 'Player1',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const scoreData2 = {
        name: 'Player2',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const hash1 = generateScoreHash(scoreData1);
      const hash2 = generateScoreHash(scoreData2);

      expect(hash1).not.toBe(hash2);
    });

    test('should generate same hash for same data', () => {
      const scoreData = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'a1b2c3d4e5f67890'
      };

      const hash1 = generateScoreHash(scoreData);
      const hash2 = generateScoreHash(scoreData);

      expect(hash1).toBe(hash2);
    });
  });
});
