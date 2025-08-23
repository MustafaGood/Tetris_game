const dotenv = require('dotenv');

/*
 Konfigurationsmodul för backend:
  - Samlar miljövariabler och säkra standardvärden på ett ställe
  - Förhindrar krascher i utveckling/test om variabler saknas
*/

// Läser in variabler från .env om filen finns
dotenv.config();

// Hämtar nuvarande NODE_ENV, standard är 'development'
const getNodeEnv = () => process.env.NODE_ENV || 'development';

const config = {
  get NODE_ENV() { return getNodeEnv(); },
  PORT: parseInt(process.env.PORT) || 3001,
  // Säkra standardvärden så att importerande moduler inte kraschar i dev/test
  get MONGODB_URI() {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
    if (getNodeEnv() === 'test') return 'mongodb://127.0.0.1:27017/tetris-test';
    return 'mongodb://127.0.0.1:27017/tetris-dev';
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  SCORE_LIMIT_WINDOW_MS: parseInt(process.env.SCORE_LIMIT_WINDOW_MS) || 60 * 1000,
  SCORE_LIMIT_MAX_REQUESTS: parseInt(process.env.SCORE_LIMIT_MAX_REQUESTS) || 10,
  GAME_SEED_EXPIRY_MS: parseInt(process.env.GAME_SEED_EXPIRY_MS) || 5 * 60 * 1000,
  SCORE_TOLERANCE_PERCENT: parseInt(process.env.SCORE_TOLERANCE_PERCENT) || 30,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
};

const isProduction = () => (process.env.NODE_ENV || 'development') === 'production';
const isDevelopment = () => (process.env.NODE_ENV || 'development') === 'development';
const isTest = () => (process.env.NODE_ENV || 'development') === 'test';

const getCorsOrigins = () => {
  return (config.CORS_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean);
};

module.exports = {
  ...config,
  isProduction,
  isDevelopment,
  isTest,
  getCorsOrigins
};
