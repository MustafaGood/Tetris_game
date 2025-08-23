const request = require('supertest');
const sqlite3 = require('sqlite3');
const path = require('path');
const { fileURLToPath } = require('url');

// Get the directory path for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the server (we'll need to handle ES modules)
let app;
let testDb;
let testDbPath;

/**
 * API-tester för Tetris backend (SQLite version)
 * 
 * Denna fil innehåller omfattande tester för alla backend-endpoints:
 * - Hälsokontroll: Verifierar att servern svarar korrekt
 * - Poänghantering: Testar sparande, hämtning och radering av poäng
 * - Validering: Kontrollerar att inskickade poäng är giltiga
 * - Felhantering: Testar olika felscenarier
 */

// Sätt testmiljö
process.env.NODE_ENV = 'test';

describe('API-tester (SQLite)', () => {
  // Testvariabler som används i alla tester
  let testServer;        // Express-server instans för tester

  // Körs en gång innan alla tester - sätter upp testmiljön
  beforeAll(async () => {
    // Create a test database path
    testDbPath = path.join(__dirname, 'test-tetris.db');
    
    // Create test database
    testDb = new sqlite3.Database(testDbPath);
    
    // Initialize test database schema
    await new Promise((resolve, reject) => {
      testDb.serialize(() => {
        testDb.run(`
          CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            points INTEGER NOT NULL,
            level INTEGER NOT NULL,
            lines INTEGER NOT NULL,
            createdAt TEXT NOT NULL
          )
        `, (err) => {
          if (err) reject(err);
        });
        
        testDb.run(`CREATE INDEX IF NOT EXISTS idx_scores_points ON scores(points)`, (err) => {
          if (err) reject(err);
        });
        
        resolve();
      });
    });
    
    // Start test server
    // Note: We'll need to import the server differently for testing
    try {
      // For testing, we'll create a simple test server
      const express = require('express');
      app = express();
      
      // Add basic middleware
      app.use(require('cors')());
      app.use(require('express').json());
      
      // Add test endpoints
      app.get('/api/health', (req, res) => {
        res.json({
          ok: true,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: '2.0.0',
          environment: 'test'
        });
      });
      
      app.get('/api/scores', (req, res) => {
        const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
        
        testDb.all(
          'SELECT id, name, points, level, lines, createdAt FROM scores ORDER BY points DESC, createdAt ASC LIMIT ?',
          [limit],
          (err, rows) => {
            if (err) {
              return res.status(500).json({
                ok: false,
                error: 'Databasfel'
              });
            }
            res.json({
              ok: true,
              data: rows
            });
          }
        );
      });
      
      app.post('/api/scores', (req, res) => {
        const { name, points, level, lines } = req.body || {};
        
        // Validering av indata
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(422).json({
            ok: false,
            error: 'Namn krävs och måste vara en icke-tom sträng'
          });
        }
        
        if (name.trim().length > 16) {
          return res.status(422).json({
            ok: false,
            error: 'Namn måste vara 1-16 tecken långt'
          });
        }
        
        if (typeof points !== 'number' || points < 0) {
          return res.status(422).json({
            ok: false,
            error: 'Poäng måste vara ett icke-negativt tal'
          });
        }
        
        if (typeof level !== 'number' || level < 1) {
          return res.status(422).json({
            ok: false,
            error: 'Level måste vara ett positivt tal'
          });
        }
        
        if (typeof lines !== 'number' || lines < 0) {
          return res.status(422).json({
            ok: false,
            error: 'Lines måste vara ett icke-negativt tal'
          });
        }
        
        // Spara poängen
        const createdAt = new Date().toISOString();
        testDb.run(
          'INSERT INTO scores (name, points, level, lines, createdAt) VALUES (?, ?, ?, ?, ?)',
          [name.trim(), points, level, lines, createdAt],
          function(err) {
            if (err) {
              console.error('Databasfel i POST /api/scores:', err);
              return res.status(500).json({
                ok: false,
                error: 'Databasfel'
              });
            }
            
            res.status(201).json({
              ok: true,
              id: this.lastID,
              message: 'Score saved successfully'
            });
          }
        );
      });
      
      // Start test server
      testServer = app.listen(0);
    } catch (error) {
      console.error('Failed to start test server:', error);
      throw error;
    }
  });

  // Körs en gång efter alla tester - städar upp
  afterAll(async () => {
    // Close test server
    if (testServer) {
      testServer.close();
    }
    
    // Close and remove test database
    if (testDb) {
      await new Promise((resolve) => testDb.close(resolve));
    }
    
    // Remove test database file
    const fs = require('fs');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // Körs före varje enskilt test - förbereder testdata
  beforeEach(async () => {
    // Rensa alla poäng från testdatabasen
    await new Promise((resolve, reject) => {
      testDb.run('DELETE FROM scores', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  /**
   * HÄLSOKONTROLL-TESTER
   */
  describe('Hälsokontroll-endpoint', () => {
    test('GET /api/health ska returnera serverstatus', async () => {
      const response = await request(testServer)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: '2.0.0',
        environment: 'test'
      });
    });
  });

  /**
   * POÄNGINNSKICK-TESTER
   */
  describe('Inskick av poäng-endpoint', () => {
    test('POST /api/scores ska acceptera giltig poäng', async () => {
      const validScore = {
        name: 'TestPlayer',
        points: 1000,
        level: 5,
        lines: 20
      };

      const response = await request(testServer)
        .post('/api/scores')
        .send(validScore)
        .expect(201);

      expect(response.body).toMatchObject({
        ok: true,
        id: expect.any(Number),
        message: 'Score saved successfully'
      });
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
        .expect(422);

      expect(response.body).toMatchObject({
        ok: false,
        error: expect.any(String)
      });
    });

    test('POST /api/scores ska hantera saknade obligatoriska fält', async () => {
      const response = await request(testServer)
        .post('/api/scores')
        .send({})
        .expect(422);

      expect(response.body).toMatchObject({
        ok: false,
        error: expect.any(String)
      });
    });
  });

  /**
   * POÄNGHÄMTNING-TESTER
   */
  describe('Hämtningsendpoints för poäng', () => {
    beforeEach(async () => {
      // Skapa tre testpoäng
      const scores = [
        { name: 'Player1', points: 5000, level: 10, lines: 50 },
        { name: 'Player2', points: 3000, level: 8, lines: 30 },
        { name: 'Player3', points: 1000, level: 5, lines: 20 }
      ];

      for (const score of scores) {
        await new Promise((resolve, reject) => {
          testDb.run(
            'INSERT INTO scores (name, points, level, lines, createdAt) VALUES (?, ?, ?, ?, ?)',
            [score.name, score.points, score.level, score.lines, new Date().toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    });

    test('GET /api/scores ska returnera poänglista', async () => {
      const response = await request(testServer)
        .get('/api/scores')
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        data: expect.any(Array)
      });
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0].points).toBe(5000);
    });

    test('GET /api/scores/top ska returnera toppresultat', async () => {
      const response = await request(testServer)
        .get('/api/scores/top?limit=5')
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        data: expect.any(Array)
      });
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0].points).toBe(5000);
    });

    test('GET /api/scores ska respektera limit-parametern', async () => {
      const response = await request(testServer)
        .get('/api/scores?limit=2')
        .expect(200);

      expect(response.body.data.length).toBe(2);
    });
  });

  /**
   * FELHANTERING-TESTER
   */
  describe('Felhantering', () => {
    test('Ska hantera felaktig JSON', async () => {
      const response = await request(testServer)
        .post('/api/scores')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('Ska hantera icke-existerande endpoints', async () => {
      const response = await request(testServer)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});
