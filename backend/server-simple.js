import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

// Enkel utvecklingsserver (mock) för att testa API-funktioner lokalt.
// Kommentarer och meddelanden är översatta till svenska för tydlighet.
const app = express();

// --- Säkerhetsrelaterad middleware ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  })
);

// Komprimering för att minska svarsstorlek
app.use(compression());

// CORS-inställningar: tillåt lokala frontend-portar
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: false,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200,
  })
);

// Enkel rate-limiting för utveckling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 100,
  message: {
    error: 'För många förfrågningar från denna IP. Försök igen senare.',
    retryAfter: '15 minuter',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Enkel request-logging
app.use(morgan('dev'));

// JSON-body parsing med begränsning
app.use(express.json({ limit: '1mb' }));
app.options('*', cors());

// Mock-datastruktur för poäng (i minnet)
let scores = [
  {
    id: 1,
    name: 'TestPlayer',
    points: 1000,
    level: 5,
    lines: 20,
    createdAt: new Date().toISOString()
  },
];

// ---- Routes ----

// Hälsokontroll (healthcheck)
app.get('/api/health', (req, res) => {
  console.log('🏥 Hälsokontroll begärd');
  res.json({
    ok: true,
    message: 'Servern körs',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Generera ett enkelt game-seed (mock)
app.get('/api/game/seed', (req, res) => {
  try {
    const seed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    res.json({ seed, timestamp, expiresAt: timestamp + 5 * 60 * 1000 });
  } catch (err) {
    console.error('❌ Fel vid generering av game seed:', err);
    res.status(500).json({ error: 'Fel vid generering av seed', details: err && err.message });
  }
});

// Hämta topplista
app.get('/api/scores/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const topScores = scores.slice(0, limit);
  res.json({ ok: true, data: topScores });
});

// Spara poäng
app.post('/api/scores', (req, res) => {
  const { name, points, level, lines, gameSeed, gameDuration } = req.body || {};

  // Enkel debug-logg för utveckling
  console.log('🔍 Debug - Mottagna poängdata:', req.body);
  console.log('🔍 Debug - Utdragna värden:', { name, points, level, lines, gameSeed, gameDuration });

  // Validering (enkla kontroller)
  if (typeof name !== 'string' || name.trim().length === 0) {
    console.log('❌ Validering misslyckades - ogiltigt namn');
    return res.status(400).json({ error: 'Namn krävs och måste vara en icke-tom textsträng' });
  }

  if (typeof points !== 'number' || !Number.isFinite(points) || points < 0) {
    console.log('❌ Validering misslyckades - ogiltiga poäng');
    return res.status(400).json({ error: 'Poäng måste vara ett icke-negativt tal' });
  }

  if (typeof level !== 'number' || !Number.isFinite(level) || level < 1) {
    console.log('❌ Validering misslyckades - ogiltig nivå');
    return res.status(400).json({ error: 'Nivå måste vara ett positivt tal' });
  }

  if (typeof lines !== 'number' || !Number.isFinite(lines) || lines < 0) {
    console.log('❌ Validering misslyckades - ogiltigt antal rader');
    return res.status(400).json({ error: 'Rader måste vara ett icke-negativt tal' });
  }

  // Extra kontroll: hög poäng kräver gameSeed i detta mock-exempel
  if (points > 1000 && !gameSeed) {
    return res.status(400).json({
      error: 'Saknade obligatoriska fält',
      reason: 'Game seed krävs för mycket höga poäng',
    });
  }

  const newScore = {
    id: scores.length + 1,
    name: String(name).trim().slice(0, 50),
    points: Number(points),
    level: Number(level),
    lines: Number(lines),
    createdAt: new Date().toISOString(),
    gameSeed: gameSeed || null,
    gameDuration: typeof gameDuration === 'number' ? gameDuration : null,
  };

  scores.push(newScore);
  // Sortera topplistan i fallande ordning
  scores.sort((a, b) => b.points - a.points);

  console.log(`✅ Poäng sparad: ${newScore.name} - ${newScore.points} poäng`);
  res.status(201).json({
    ok: true,
    id: newScore.id,
    message: 'Poäng sparad',
  });
});

// Radera poäng (mock)
app.delete('/api/scores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = scores.findIndex((score) => score.id === id);

  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'Poäng hittades inte' });
  }

  scores.splice(index, 1);
  console.log(`🗑️ Poäng raderad: ID ${id}`);
  res.json({
    ok: true,
    deleted: 1,
    message: 'Poäng raderad',
    data: { deleted: 1, message: 'Poäng raderad' }
  });
});

// Fallback för icke-existerande endpoints
app.use((_req, res) => res.status(404).json({ error: 'Ändpunkt hittades inte' }));

// Enkel global felhanterare
app.use((err, req, res, next) => {
  console.error('❌ Ohanterat fel:', err);
  res.status(500).json({
    error: 'Internt serverfel',
    message: err && err.message,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Enkel API-server igång på http://localhost:${PORT}`);
  console.log(`🌍 Miljö: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔒 Säkerhet: Rate limiting, Helmet och CORS aktiverat');
  console.log('📝 Loggning: Morgan aktiverat');
  console.log('🗜️ Komprimering: Gzip aktiverat');
  console.log('🎯 CORS Origins: http://localhost:3000, http://localhost:5173');
});

export default app;
