import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server-mongo.js';
import Score from '../models/Score.js';
import { generateGameSeed, validateScore, calculateExpectedScore } from '../utils/scoreCalculator.js';

// API-tester för backend:
//  - Verifierar hälsoendpoints, spel-seed, validering av poäng,
//    inskick, hämtning, radering och admin-analys

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/tetris-test';

describe('API-tester', () => {
  let testServer;
  let validGameSeed;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    testServer = app.listen(0); 
  });

  afterAll(async () => {
    await mongoose.connection.close();
    testServer.close();
  });

  beforeEach(async () => {
    await Score.deleteMany({});
    validGameSeed = generateGameSeed();
  });

  // --- Hälsokontroll ---
  // Bekräftar att servern svarar och metadata finns
  describe('Hälsokontroll-endpoint', () => {
    test('GET /api/health ska returnera serverstatus', async () => {
      const response = await request(testServer)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        db: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: '2.0.0',
        environment: 'test'
      });
    });
  });


  // --- Spel-seed ---
  // Ger en engångs-seed för spelet (används för att reproducera spel)
  describe('Spel-seed-endpoint', () => {
    test('GET /api/game/seed ska returnera giltigt seed', async () => {
      const response = await request(testServer)
        .get('/api/game/seed')
        .expect(200);

      expect(response.body).toMatchObject({
        seed: expect.any(String),
        timestamp: expect.any(Number),
        expiresAt: expect.any(Number)
      });

      expect(response.body.seed).toMatch(/^[a-f0-9]{16}$/);
      expect(response.body.expiresAt).toBeGreaterThan(response.body.timestamp);
    });

    test('GET /api/game/seed ska returnera olika seeds', async () => {
      const response1 = await request(testServer).get('/api/game/seed');
      const response2 = await request(testServer).get('/api/game/seed');

      expect(response1.body.seed).not.toBe(response2.body.seed);
    });
  });


  // --- Validering av poäng ---
  // Validerar att inskickade poäng är rimliga och följer regler
  describe('Validering av poäng-endpoint', () => {
    test('POST /api/scores/validate ska validera giltig poäng', async () => {
      const validScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: validGameSeed,
        gameDuration: 120000
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(validScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: true,
        expectedScore: expect.any(Number)
      });
    });

    test('POST /api/scores/validate ska neka ogiltigt namn', async () => {
      const invalidScore = {
        name: '',
        points: 1000,
        level: 5,
        lines: 20
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        reason: 'Invalid name'
      });
    });

    test('POST /api/scores/validate ska neka ogiltiga poäng', async () => {
      const invalidScore = {
        name: 'TestPlayer',
        points: -100,
        level: 5,
        lines: 20
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        reason: 'Invalid points'
      });
    });

    test('POST /api/scores/validate ska neka ogiltig nivå', async () => {
      const invalidScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 25, 
        lines: 20
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        reason: 'Invalid level'
      });
    });

    test('POST /api/scores/validate ska neka omöjlig poäng', async () => {
      const impossibleScore = {
        name: 'TestPlayer',
        points: 999999, 
        level: 1,
        lines: 5,
        gameSeed: validGameSeed
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(impossibleScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        reason: expect.stringContaining('Score too high')
      });
    });

    test('POST /api/scores/validate ska neka ogiltigt game seed', async () => {
      const invalidScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: 'invalid-seed'
      };

      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        reason: 'Invalid game seed'
      });
    });
  });


  // --- Inskick av poäng ---
  // Testar att poäng kan sparas och att felhantering fungerar
  describe('Inskick av poäng-endpoint', () => {
    test('POST /api/scores ska acceptera giltig poäng', async () => {
      const validScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: validGameSeed,
        gameDuration: 120000
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(validScore)
        .expect(201);

      expect(response.body).toMatchObject({
        ok: true,
        id: expect.any(String),
        message: 'Score saved successfully',
        expectedScore: expect.any(Number)
      });

      const savedScore = await Score.findById(response.body.id);
      expect(savedScore).toBeTruthy();
      expect(savedScore.name).toBe('TestPlayer');
      expect(savedScore.points).toBe(1000);
      expect(savedScore.gameSeed).toBe(validGameSeed);
      expect(savedScore.gameDuration).toBe(120000);
      expect(savedScore.clientIP).toBeTruthy();
      expect(savedScore.userAgent).toBeTruthy();
    });

    test('POST /api/scores ska neka ogiltig poäng', async () => {
      const invalidScore = {
        name: '',
        points: -100,
        level: 25,
        lines: -5
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(invalidScore)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Score validation failed',
        reason: expect.any(String)
      });
    });

    test('POST /api/scores ska neka omöjlig poäng', async () => {
      const impossibleScore = {
        name: 'TestPlayer',
        points: 999999,
        level: 1,
        lines: 5,
        gameSeed: validGameSeed
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(impossibleScore)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Score validation failed',
        reason: expect.stringContaining('Score too high')
      });
    });

    test('POST /api/scores ska hantera saknade valfria fält', async () => {
      const minimalScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(minimalScore)
        .expect(201);

      expect(response.body.ok).toBe(true);

      const savedScore = await Score.findById(response.body.id);
      expect(savedScore.gameSeed).toBeNull();
      expect(savedScore.gameDuration).toBeNull();
    });

    test('POST /api/scores ska upptäcka misstänkta mönster', async () => {
      const normalScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: validGameSeed
      };

      await request(testServer)
        .post('/api/scores')
        .send(normalScore)
        .expect(201);

      const suspiciousScore = {
        name: 'TestPlayer',
        points: 100000, 
        level: 6,
        lines: 25,
        gameSeed: generateGameSeed()
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(suspiciousScore)
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.stringContaining('Suspicious')
      });
    });
  });


  // --- Hämtning av poäng ---
  // Kontrollerar topplistor, paginering och svarsmekanismer
  describe('Hämtningsendpoints för poäng', () => {
    beforeEach(async () => {
      const scores = [
        { name: 'Player1', points: 5000, level: 10, lines: 50, gameSeed: validGameSeed },
        { name: 'Player2', points: 3000, level: 8, lines: 30, gameSeed: validGameSeed },
        { name: 'Player3', points: 1000, level: 5, lines: 20, gameSeed: validGameSeed }
      ];

      for (const score of scores) {
        await Score.create(score);
      }
    });

    test('GET /api/scores/top ska returnera toppresultat', async () => {
      const response = await request(testServer)
        .get('/api/scores/top?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body[0].points).toBe(5000);  
      expect(response.body[0].name).toBe('Player1');
    });

    test('GET /api/scores/top ska respektera limit-parametern', async () => {
      const response = await request(testServer)
        .get('/api/scores/top?limit=2')
        .expect(200);

      expect(response.body.length).toBe(2);
    });

    test('GET /api/scores ska returnera paginerade resultat', async () => {
      const response = await request(testServer)
        .get('/api/scores?page=1&size=2')
        .expect(200);

      expect(response.body).toMatchObject({
        page: 1,
        size: 2,
        total: 3,
        items: expect.any(Array)
      });
      expect(response.body.items.length).toBe(2);
    });

    test('GET /api/scores ska hantera ogiltig paginering', async () => {
      const response = await request(testServer)
        .get('/api/scores?page=0&size=1000')
        .expect(200);

      expect(response.body.page).toBe(1); 
      expect(response.body.size).toBe(100);  
    });
  });


  // --- Radering av poäng ---
  // Testar borttagning och fel vid radering
  describe('Radering av poäng-endpoint', () => {
    let scoreId;

    beforeEach(async () => {
      const score = await Score.create({
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: validGameSeed
      });
      scoreId = score._id;
    });

    test('DELETE /api/scores/:id ska radera befintlig poäng', async () => {
      const response = await request(testServer)
        .delete(`/api/scores/${scoreId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        deleted: 1,
        message: 'Score deleted successfully'
      });

      const deletedScore = await Score.findById(scoreId);
      expect(deletedScore).toBeNull();
    });

    test('DELETE /api/scores/:id ska hantera icke-existerande poäng', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(testServer)
        .delete(`/api/scores/${fakeId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Score not found'
      });
    });

    test('DELETE /api/scores/:id ska hantera ogiltigt ID-format', async () => {
      const response = await request(testServer)
        .delete('/api/scores/invalid-id')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid score ID'
      });
    });
  });


  // --- Admin-analys ---
  // Ger analys över poäng, misstänkta poster och mönster
  describe('Admin-analys-endpoint', () => {
    beforeEach(async () => {
      const scores = [
        { name: 'Player1', points: 1000, level: 5, lines: 20, gameSeed: validGameSeed },
        { name: 'Player1', points: 50000, level: 6, lines: 25, gameSeed: generateGameSeed() }, 
        { name: 'Player2', points: 2000, level: 8, lines: 30, gameSeed: validGameSeed }
      ];

      for (const score of scores) {
        await Score.create(score);
      }
    });

    test('GET /admin/scores/analysis ska returnera analys', async () => {
      const response = await request(testServer)
        .get('/admin/scores/analysis')
        .expect(200);

      expect(response.body).toMatchObject({
        totalScores: 3,
        suspiciousScores: expect.any(Array),
        patterns: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });

    test('GET /admin/scores/analysis ska filtrera på spelarens namn', async () => {
      const response = await request(testServer)
        .get('/admin/scores/analysis?playerName=Player1')
        .expect(200);

      expect(response.body.totalScores).toBe(2);
    });

    test('GET /admin/scores/analysis ska respektera limit-parametern', async () => {
      const response = await request(testServer)
        .get('/admin/scores/analysis?limit=1')
        .expect(200);

      expect(response.body.totalScores).toBe(1);
    });
  });


  // --- Hastighetsbegränsning (rate limiting) ---
  // Säkrar att snabba upprepade förfrågningar begränsas
  describe('Hastighetsbegränsning', () => {
    test('Ska begränsa snabba förfrågningar', async () => {
      const requests = Array(15).fill().map(() => 
        request(testServer).get('/api/health')
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    test('Ska begränsa inskick av poäng', async () => {
      const validScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20,
        gameSeed: validGameSeed
      };

      const requests = Array(15).fill().map(() => 
        request(testServer).post('/api/scores').send(validScore)
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });


  // --- Felhantering ---
  // Verifierar beteende vid ogiltig JSON, saknade fält och 404
  describe('Felhantering', () => {
    test('Ska hantera felaktig JSON', async () => {
      const response = await request(testServer)
        .post('/api/scores')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('Ska hantera saknade obligatoriska fält', async () => {
      const response = await request(testServer)
        .post('/api/scores')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Score validation failed'
      });
    });

    test('Ska hantera icke-existerande endpoints', async () => {
      const response = await request(testServer)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Endpoint not found'
      });
    });
  });
});
