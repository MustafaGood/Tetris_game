import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Express-backend som använder SQLite för att spara poäng
// Koden innehåller grundläggande säkerhet, CORS och enkla REST-endpoints

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Databas (SQLite)
const dbPath = path.join(__dirname, 'tetris.db');
const db = new sqlite3.Database(dbPath);

// Säkerställer att tabeller och index finns
db.serialize(() => {
  console.log('Initierar databas...');
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      points INTEGER NOT NULL,
      level INTEGER NOT NULL,
      lines INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Fel vid skapande av scores-tabell:', err);
    } else {
      console.log('Scores-tabell klar');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_scores_points ON scores(points)`, (err) => {
    if (err) {
      console.error('Fel vid skapande av index:', err);
    } else {
      console.log('Databasindex klart');
    }
  });
});

// Express-app och middleware
// Skapar appen och registrerar middleware för säkerhet, prestanda och loggning
const app = express();

// Säkerhetsheaders via Helmet (grundläggande CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3001", "http://127.0.0.1:3001"],
    },
  },
  xFrameOptions: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Lägg till X-XSS-Protection header
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Komprimerar svar för bättre prestanda
app.use(compression());

// CORS - tillåtna origins (utvecklingsmiljö)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser för JSON-body med storleksgräns
app.use(express.json({ limit: '1mb' }));

// HTTP request logging
app.use(morgan('combined'));


// Hälsokontroll: enklaste möjliga endpoint för att verifiera att servern körs
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});


// Hämta poänglista (kan begränsas med ?limit=)
app.get('/api/scores', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);

  db.all(
    'SELECT id, name, points, level, lines, createdAt FROM scores ORDER BY points DESC, createdAt ASC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        console.error('Databasfel i GET /api/scores:', err);
        return res.status(500).json({
          ok: false,
          error: 'Databasfel',
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internt serverfel'
        });
      }
      console.log(`Hämtade ${rows.length} poäng`);
      res.json({
        ok: true,
        data: rows
      });
    }
  );
});

// Hämta topplista (samma som /api/scores men separat endpoint för tydlighet)
app.get('/api/scores/top', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);

  db.all(
    'SELECT id, name, points, level, lines, createdAt FROM scores ORDER BY points DESC, createdAt ASC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        console.error('Databasfel i GET /api/scores/top:', err);
        return res.status(500).json({
          ok: false,
          error: 'Databasfel',
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internt serverfel'
        });
      }
      console.log(`Hämtade ${rows.length} top-poäng`);
      res.json({
        ok: true,
        data: rows
      });
    }
  );
});


// Skapa ny poängpost
app.post('/api/scores', (req, res) => {
  const { name, points, level, lines, gameDuration } = req.body || {};

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

  const now = new Date().toISOString();
  const sanitizedName = String(name).trim().slice(0, 16);

  db.run(
    'INSERT INTO scores(name, points, level, lines, createdAt) VALUES (?, ?, ?, ?, ?)',
    [sanitizedName, Math.floor(points), Math.floor(level), Math.floor(lines), now],
    function(err) {
      if (err) {
        console.error('Databasfel i POST /api/scores:', err);
        return res.status(500).json({
          ok: false,
          error: 'Databasfel',
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internt serverfel'
        });
      }
      console.log(`Poäng sparad: ${sanitizedName} - ${points} poäng`);
      res.status(201).json({
        ok: true,
        data: {
          id: this.lastID,
          message: 'Poäng sparades'
        }
      });
    }
  );
});


app.delete('/api/scores/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      ok: false,
  error: 'Ogiltigt ID - måste vara ett nummer' 
    });
  }
  
  const scoreId = parseInt(id);
  
  db.run(
    'DELETE FROM scores WHERE id = ?',
    [scoreId],
    function(err) {
      if (err) {
        console.error('Databasfel i DELETE /api/scores:', err);
        return res.status(500).json({ 
          ok: false,
          error: 'Databasfel', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internt serverfel'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          ok: false,
          error: 'Poängen hittades inte' 
        });
      }

      console.log(`Poäng raderad: ID ${scoreId}`);
      res.json({ 
        ok: true, 
        data: {
          deleted: this.changes,
          message: 'Poäng raderades'
        }
      });
    }
  );
});


app.get('/api/stats', (req, res) => {
  db.get(
    'SELECT COUNT(*) as totalScores, MAX(points) as highestScore, AVG(points) as averageScore FROM scores',
    (err, row) => {
      if (err) {
        console.error('Databasfel i GET /api/stats:', err);
        return res.status(500).json({ 
          ok: false,
          error: 'Databasfel', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internt serverfel'
        });
      }
      res.json({
        ok: true,
        data: {
          totalScores: row.totalScores || 0,
          highestScore: row.highestScore || 0,
          averageScore: Math.round(row.averageScore || 0)
        }
      });
    }
  );
});


app.use((err, req, res, next) => {
  console.error('Ohanterat fel:', err);
  res.status(500).json({ 
    ok: false,
    error: 'Internt serverfel',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Något gick fel'
  });
});


app.use('*', (req, res) => {
  res.status(404).json({ 
    ok: false,
    error: 'Endpoint hittades inte' 
  });
});


process.on('SIGTERM', () => {
  console.log('SIGTERM mottaget, stänger ner graciöst');
  db.close((err) => {
    if (err) {
      console.error('Fel vid stängning av databas:', err);
    } else {
      console.log('Databasanslutning stängd');
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT mottaget, stänger ner graciöst');
  db.close((err) => {
    if (err) {
      console.error('Fel vid stängning av databas:', err);
    } else {
      console.log('Databasanslutning stängd');
    }
    process.exit(0);
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend-servern startad!`);
  console.log(`Server lyssnar på http://localhost:${PORT}`);
  console.log(`Hälsokontroll: http://localhost:${PORT}/api/health`);
  console.log(`Databas: ${dbPath}`);
  console.log(`Miljö: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing
export default app; 