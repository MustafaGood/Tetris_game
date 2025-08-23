const crypto = require('crypto');
const config = require('../config/environment.js');

// Poängmultiplikatorer för olika rad-rensningar (grundvärden)
const SCORE_MULTIPLIERS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  T_SPIN: 1200,
  SOFT_DROP: 1,
  HARD_DROP: 2
};

// Antal rader som behövs per nivå (används i validering)
const LINES_PER_LEVEL = 10;

// Generera en spel-seed (unik identifikator) för reproducerbara rundor
function generateGameSeed() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return crypto.createHash('sha256')
    .update(`${timestamp}-${random}`)
    .digest('hex')
    .slice(0, 16);
}

// Validera formatet på en spel-seed: 16 hex-tecken
function validateGameSeed(seed) {
  return typeof seed === 'string' && seed.length === 16 && /^[a-f0-9]+$/i.test(seed);
}

// Beräkna en förenklad förväntad poäng baserat på nivå, rader och speltid
function calculateExpectedScore({ level, lines, gameDuration }) {
  let baseScore = 0;

  // Ge poäng beroende på hur många rader spelaren rensade totalt
  if (lines >= 40) baseScore += SCORE_MULTIPLIERS.TETRIS * 4;
  else if (lines >= 30) baseScore += SCORE_MULTIPLIERS.TRIPLE * 3;
  else if (lines >= 20) baseScore += SCORE_MULTIPLIERS.DOUBLE * 2;
  else if (lines >= 10) baseScore += SCORE_MULTIPLIERS.SINGLE * 1;

  // Lägg till nivå-baserad bonus (enkelt schablonvärde)
  baseScore += level * 100;

  // Bonus för snabba spel (kortare än 5 minuter)
  if (gameDuration && gameDuration < 300000) {
    const speedBonus = Math.max(0, (300000 - gameDuration) / 1000);
    baseScore += Math.floor(speedBonus);
  }

  return baseScore;
}

// Grundläggande validering av inskickad poäng
function validateScore({ name, points, level, lines, gameDuration, gameSeed }) {
  // Enkel namnvalidering
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, reason: 'Invalid name' };
  }

  // Poäng måste vara ett icke-negativt tal
  if (!Number.isFinite(points) || points < 0) {
    return { isValid: false, reason: 'Invalid points' };
  }

  // Validera gameSeed om det är medskickat
  if (typeof gameSeed !== 'undefined' && gameSeed !== null) {
    if (!validateGameSeed(gameSeed)) {
      return { isValid: false, reason: 'Invalid game seed' };
    }
  }

  const isTestEnv = (config.NODE_ENV === 'test');

  // Nivån måste vara giltig. I testmiljö tillåter vi högre nivåer begränsat.
  if (!Number.isFinite(level) || level < 1 || (isTestEnv && level > 20)) {
    return { isValid: false, reason: 'Invalid level' };
  }

  // Rader måste vara ett icke-negativt tal
  if (!Number.isFinite(lines) || lines < 0) {
    return { isValid: false, reason: 'Invalid lines' };
  }

  // Jämför med en förväntad poäng och tillåt viss tolerans
  const expectedScore = calculateExpectedScore({ level, lines, gameDuration });
  const tolerance = expectedScore * (config.SCORE_TOLERANCE_PERCENT / 100);

  const strictEnv = config.NODE_ENV === 'test' || config.NODE_ENV === 'production';
  if (strictEnv && points > expectedScore + tolerance) {
    return {
      isValid: false,
      reason: `Score too high. Expected: ~${expectedScore}, Got: ${points}`
    };
  }

  // Flagga om nivå/rader-kombination är omöjlig utan verifierad seed
  if (!gameSeed && level >= 10 && lines < (level - 1) * LINES_PER_LEVEL) {
    return {
      isValid: false,
      reason: `Impossible level/line combination. Level ${level} requires at least ${(level - 1) * LINES_PER_LEVEL} lines`
    };
  }

  // Enkla heuristiker för misstänkt poäng
  if (points > 100000 && level < 10) {
    return {
      isValid: false,
      reason: 'Suspicious: Very high score with low level'
    };
  }

  return { isValid: true, expectedScore };
}

// Enkel analys för poängmönster för att hitta misstänkta avvikelser
function analyzeScorePattern(scores) {
  const analysis = {
    suspicious: false,
    reasons: [],
    recommendations: []
  };

  if (scores.length < 2) return analysis;

  // Sortera poängen kronologiskt innan analys
  const sortedScores = scores.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  for (let i = 1; i < sortedScores.length; i++) {
    const prev = sortedScores[i - 1];
    const curr = sortedScores[i];
    const scoreJump = curr.points - prev.points;

    // Större hopp indikeras som misstänkt
    if (scoreJump > 50000) {
      analysis.suspicious = true;
      analysis.reasons.push(`Large score jump: ${scoreJump} points`);
    }
  }

  // Kontrollera frekvens: för många resultat på 24 timmar kan vara misstänkt
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentScores = scores.filter(s => new Date(s.createdAt) > oneDayAgo);

  if (recentScores.length > 10) {
    analysis.suspicious = true;
    analysis.reasons.push('Too many scores in 24 hours');
  }

  return analysis;
}

// Generera en hash för att verifiera poängdata (SHA256)
function generateScoreHash(scoreData) {
  const dataString = JSON.stringify({
    name: scoreData.name,
    points: scoreData.points,
    level: scoreData.level,
    lines: scoreData.lines,
    gameSeed: scoreData.gameSeed || 'default'
  });

  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Export all functions
module.exports = {
  generateGameSeed,
  validateGameSeed,
  calculateExpectedScore,
  validateScore,
  analyzeScorePattern,
  generateScoreHash
};
