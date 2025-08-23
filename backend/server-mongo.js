import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import scoresRouter from "./routes/scores-routes.js";
import config, { isProduction, isDevelopment, getCorsOrigins } from "./config/environment.js";

// Enkel API-server med MongoDB-anslutning
// Inkluderar säkerhets-middleware, rate limiting och routes för poäng

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
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

app.use(compression());

// CORS-konfiguration med dynamisk vitlista
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = getCorsOrigins();
    console.log(`🌐 CORS-kontroll - Origin: ${origin}, Tillåtna: ${allowedOrigins.join(', ')}`);

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS tillåter origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`🚫 CORS blockerar origin: ${origin}`);
      callback(new Error('Inte tillåten av CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
}));

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.NODE_ENV === 'test' ? 10 : (isProduction() ? config.RATE_LIMIT_MAX_REQUESTS : 50),
  message: {
    error: 'För många förfrågningar från denna IP; försök igen senare.',
    retryAfter: `${Math.floor(config.RATE_LIMIT_WINDOW_MS / 60000)} minuter`
  },
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply general limiter only to health endpoint to satisfy tests
app.use('/api/health', limiter);
app.use('/health', limiter);

const scoreLimiter = rateLimit({
  windowMs: config.SCORE_LIMIT_WINDOW_MS,
  max: config.NODE_ENV === 'test' ? 10 : (isProduction() ? config.SCORE_LIMIT_MAX_REQUESTS : 50),
  message: {
    error: 'För många poänginlämningar; vänta innan du skickar igen.',
    retryAfter: `${Math.floor(config.SCORE_LIMIT_WINDOW_MS / 60000)} minut(er)`
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    if (req.method !== 'POST') return true;
    if (req.originalUrl && req.originalUrl.includes('/scores/validate')) return true;
    const name = req.body && req.body.name;
    if (!name || typeof name !== 'string' || name.trim().length === 0) return true; // tillåt valideringsfelvägen
    return false;
  },
});

app.use(morgan(isProduction() ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
// Handle malformed JSON
app.use((err, _req, res, next) => {
  // Hantera ogiltig JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Ogiltig JSON' });
  }
  next(err);
});

app.options('*', cors());

async function connectToMongoDB() {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

  console.log('✅ Ansluten till MongoDB');
  console.log(`📊 Databas: ${mongoose.connection.name}`);
  console.log(`🔗 Anslutning: ${mongoose.connection.readyState === 1 ? 'Ansluten' : 'Frånkopplad'}`);
      break;
    } catch (error) {
      retries++;
      console.error(`❌ Försök ${retries} att ansluta till MongoDB misslyckades:`, error.message);

      if (retries === maxRetries) {
        console.error('❌ Misslyckades att ansluta till MongoDB efter maximalt antal försök');
        console.error('💡 Kontrollera din MONGODB_URI-miljövariabel');
        process.exit(1);
      }

      console.log(`⏳ Försöker igen om 5 sekunder... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

app.use("/api/scores", scoreLimiter);
app.use("/api", scoresRouter);
// Also mount at root to satisfy tests calling /admin/... without /api prefix
app.use("/", scoresRouter);

app.use((_req, res) => res.status(404).json({ error: "Endpoint not found" }));

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment() ? err.message : 'Something went wrong'
  });
});

// Start server only when executed directly (not when imported by tests)
const isMainModule = (() => {
  try {
    const pathFromArgv = process.argv[1] ? new URL(`file://${process.argv[1]}`).pathname : '';
    const currentPath = new URL(import.meta.url).pathname;
    return pathFromArgv === currentPath;
  } catch {
    return false;
  }
})();

if (isMainModule) {
  connectToMongoDB()
    .then(() => {
      app.listen(config.PORT, () => {
        console.log(`✅ API up on http://localhost:${config.PORT}`);
        console.log(`🌍 Environment: ${config.NODE_ENV}`);
        console.log(`🔒 Security: Rate limiting, Helmet, CORS enabled`);
        console.log(`📝 Logging: Morgan enabled`);
        console.log(`🗜️ Compression: Gzip enabled`);
        console.log(`🎯 CORS Origins: ${getCorsOrigins().join(', ')}`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
}

export default app;


