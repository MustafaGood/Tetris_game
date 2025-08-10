// Importerar nödvändiga bibliotek
import express from 'express'; // Webbramverk för API
import cors from 'cors'; // Hanterar CORS (Cross-Origin Resource Sharing)
import sqlite3 from 'sqlite3'; // Databasmodul för SQLite
import helmet from 'helmet'; // Säkerhetsheaders
import compression from 'compression'; // Komprimering
import morgan from 'morgan'; // Logging
import path from 'path';
import { fileURLToPath } from 'url';

// Fix för __dirname i ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Skapar en anslutning till SQLite-databasen
const dbPath = path.join(__dirname, 'tetris.db');
const db = new sqlite3.Database(dbPath);

// Initierar databasen och skapar tabellen om den inte finns
db.serialize(() => {
  console.log('🔧 Initializing database...');
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unikt ID för varje poäng
      name TEXT NOT NULL,                   -- Spelarens namn
      points INTEGER NOT NULL,              -- Poäng
      level INTEGER NOT NULL,               -- Nivå
      lines INTEGER NOT NULL,               -- Antal rader
      createdAt TEXT NOT NULL               -- Datum då poängen sparades
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating scores table:', err);
    } else {
      console.log('✅ Scores table ready');
    }
  });
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_scores_points ON scores(points)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err);
    } else {
      console.log('✅ Database index ready');
    }
  });
});

// Skapar Express-applikationen
const app = express();

// Säkerhetsheaders
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Komprimering för bättre prestanda
app.use(compression());

// CORS-konfiguration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON-hantering med storleksbegränsning
app.use(express.json({ limit: '1mb' }));

// Logging middleware
app.use(morgan('combined'));

// Hälsokontroll-endpoint för att se om servern är igång
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Hämtar highscore-listan från databasen
app.get('/api/scores', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 100); // Max 100 poster
  
  db.all(
    'SELECT id, name, points, level, lines, createdAt FROM scores ORDER BY points DESC, createdAt ASC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        console.error('❌ Database error in GET /api/scores:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      }
      console.log(`📊 Retrieved ${rows.length} scores`);
      res.json(rows);
    }
  );
});

// Sparar en ny poäng till databasen
app.post('/api/scores', (req, res) => {
  const { name, points, level, lines } = req.body || {};
  
  // Validering av input
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  
  if (typeof points !== 'number' || points < 0) {
    return res.status(400).json({ error: 'Points must be a non-negative number' });
  }
  
  if (typeof level !== 'number' || level < 1) {
    return res.status(400).json({ error: 'Level must be a positive number' });
  }
  
  if (typeof lines !== 'number' || lines < 0) {
    return res.status(400).json({ error: 'Lines must be a non-negative number' });
  }
  
  const now = new Date().toISOString();
  const sanitizedName = String(name).trim().slice(0, 16);
  
  db.run(
    'INSERT INTO scores(name, points, level, lines, createdAt) VALUES (?, ?, ?, ?, ?)',
    [sanitizedName, Math.floor(points), Math.floor(level), Math.floor(lines), now],
    function(err) {
      if (err) {
        console.error('❌ Database error in POST /api/scores:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      }
      console.log(`🏆 Score saved: ${sanitizedName} - ${points} points`);
      res.status(201).json({ 
        ok: true, 
        id: this.lastID,
        message: 'Score saved successfully'
      });
    }
  );
});

// Tar bort en poäng från databasen baserat på ID
app.delete('/api/scores/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid ID - must be a number' });
  }
  
  const scoreId = parseInt(id);
  
  db.run(
    'DELETE FROM scores WHERE id = ?',
    [scoreId],
    function(err) {
      if (err) {
        console.error('❌ Database error in DELETE /api/scores:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Score not found' });
      }
      
      console.log(`🗑️ Score deleted: ID ${scoreId}`);
      res.json({ 
        ok: true, 
        deleted: this.changes,
        message: 'Score deleted successfully'
      });
    }
  );
});

// Statistik-endpoint
app.get('/api/stats', (req, res) => {
  db.get(
    'SELECT COUNT(*) as totalScores, MAX(points) as highestScore, AVG(points) as averageScore FROM scores',
    (err, row) => {
      if (err) {
        console.error('❌ Database error in GET /api/stats:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      }
      res.json({
        totalScores: row.totalScores || 0,
        highestScore: row.highestScore || 0,
        averageScore: Math.round(row.averageScore || 0)
      });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

// Startar servern på angiven port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server started successfully!`);
  console.log(`📡 Server listening on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 