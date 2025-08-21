import { Router } from "express";
import mongoose from "mongoose";
import { validateScore, generateGameSeed, analyzeScorePattern, generateScoreHash } from "../utils/scoreCalculator.js";
import config from "../config/environment.js";
import Score from "../models/Score.js";

const router = Router();

// Hälsokontroll för API och databasanslutning
router.get("/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    ok: true,
    db: states[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "2.0.0",
    environment: config.NODE_ENV,
  });
});

// Enkel statistik-endpoint: totala poäng, högsta och genomsnitt
router.get('/stats', async (_req, res) => {
  try {
    const [totalScores, highestScoreDoc, averageScoreAgg] = await Promise.all([
      Score.countDocuments(),
      Score.findOne().sort({ points: -1 }).lean(),
      Score.aggregate([
        { $group: { _id: null, avg: { $avg: "$points" } } }
      ])
    ]);

    const averageScore = averageScoreAgg && averageScoreAgg[0] ? Math.round(averageScoreAgg[0].avg) : 0;
    res.json({ ok: true, data: { totalScores, highestScore: highestScoreDoc ? highestScoreDoc.points : 0, averageScore } });
  } catch (err) {
    console.error('❌ Error fetching stats:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

// Generera en spel-seed som klienten kan använda för reproducerbara rundor
router.get("/game/seed", (req, res) => {
  try {
    const seed = generateGameSeed();
    const timestamp = Date.now();

    console.log(`🎲 Generated game seed: ${seed} at ${new Date(timestamp).toISOString()}`);

    res.json({ seed, timestamp, expiresAt: timestamp + config.GAME_SEED_EXPIRY_MS });
  } catch (err) {
    console.error('❌ Error generating game seed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lista poäng med pagination
router.get("/scores", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const size = Math.min(parseInt(req.query.size) || 20, 100);
    const skip = (page - 1) * size;

    const [scores, total] = await Promise.all([
      Score.find()
        .sort({ points: -1, createdAt: 1 })
        .skip(skip)
        .limit(size)
        .lean(),
      Score.countDocuments()
    ]);
    res.json({ page, size, total, items: scores });
  } catch (err) {
    console.error('❌ Error fetching scores:', err);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Hämta topp-n poäng
router.get("/scores/top", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const scores = await Score.find()
      .sort({ points: -1, createdAt: 1 })
      .limit(limit)
      .lean();
    res.json(scores);
  } catch (err) {
    console.error('❌ Error fetching top scores:', err);
    res.status(500).json({ error: 'Failed to fetch top scores' });
  }
});

// Validera en poäng-post utan att spara (användbart för klienten)
router.post("/scores/validate", (req, res) => {
  try {
    const { name, points, level, lines, gameDuration, gameSeed } = req.body || {};
    const validation = validateScore({ name, points, level, lines, gameDuration, gameSeed });
    res.json(validation);
  } catch (err) {
    console.error('❌ Error validating score:', err);
    res.status(500).json({ error: err.message });
  }
});

// Spara en poängpost med grundläggande anti-cheat-kontroller
router.post("/scores", async (req, res) => {
  try {
    const { name, points, level, lines, gameDuration, gameSeed } = req.body || {};

    // Grundläggande fältvalidering innan mer avancerad analys
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Score validation failed', reason: 'Invalid name' });
    }

    if (name.trim().length > 16) {
      return res.status(400).json({ error: 'Score validation failed', reason: 'Invalid name' });
    }

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({ error: 'Score validation failed', reason: 'Invalid points' });
    }

    if (typeof level !== 'number' || level < 1) {
      return res.status(400).json({ error: 'Score validation failed', reason: 'Invalid level' });
    }

    if (typeof lines !== 'number' || lines < 0) {
      return res.status(400).json({ error: 'Score validation failed', reason: 'Invalid lines' });
    }

    // Kontrollera misstänkta mönster tidigt för att matcha testbeteende
    const recentPlayerScores = await Score.find({ name: String(name).trim() })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (recentPlayerScores.length > 0 && config.NODE_ENV !== 'development') {
      // Inkludera den inkommande poängen i analysen för att upptäcka stora hopp
      const scoresForAnalysis = [
        ...recentPlayerScores,
        { points: Number(points), createdAt: new Date() }
      ];
      const patternAnalysisEarly = analyzeScorePattern(scoresForAnalysis);
      if (patternAnalysisEarly.suspicious) {
        console.warn(`🚨 Suspicious score pattern detected for player ${name}:`, patternAnalysisEarly.reasons);
        return res.status(400).json({ 
          ok: false,
          error: "Suspicious score pattern detected", 
          reasons: patternAnalysisEarly.reasons 
        });
      }
    }

    // Anti-cheat validering baserat på poänglogik
    const validation = validateScore({ name, points, level, lines, gameDuration, gameSeed });
    if (!validation.isValid) {
      console.warn(`🚨 Anti-cheat validation failed: ${validation.reason}`);
      if (config.NODE_ENV === 'development') {
        console.warn('⚠️ Development mode: allowing score despite validation failure');
      } else {
        return res.status(400).json({ error: "Score validation failed", reason: validation.reason, expectedScore: validation.expectedScore });
      }
    }

    // Generera en enkel hash för poäng-posten
    const scoreHash = generateScoreHash({ name, points, level, lines });

    const doc = await Score.create({
      name: String(name).trim().slice(0, 16),
      points: Number(points),
      level: Number(level),
      lines: Number(lines),
      gameDuration: gameDuration || null,
      gameSeed: gameSeed || null,
      scoreHash: scoreHash,
      clientIP: req.ip,
      userAgent: req.get('User-Agent') || 'unknown-test-agent'
    });

    console.log(`✅ Score saved with anti-cheat validation: ${name} - ${points} points`);
    return res.status(201).json({ 
      ok: true,
      id: doc._id, 
      message: "Score saved successfully",
      expectedScore: validation.expectedScore
    });
  } catch (err) {
    console.error('❌ Error saving score:', err);
    return res.status(500).json({ 
      ok: false,
      error: 'Failed to save score' 
    });
  }
});

// Radera en poängpost (administrativt)
router.delete("/scores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: "Invalid score ID" });
    }
    const result = await Score.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ ok: false, error: "Score not found" });
    return res.json({ 
      ok: true, 
      deleted: 1, 
      message: "Score deleted successfully",
      data: { deleted: 1, message: "Score deleted successfully" }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Administrativ analys av poäng för att hitta misstänkta poster eller mönster
router.get("/admin/scores/analysis", async (req, res) => {
  try {
    const { playerName, limit = 50 } = req.query;

    let query = {};
    if (playerName) {
      query.name = new RegExp(playerName, 'i');
    }

    const scores = await Score.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const analysis = {
      totalScores: scores.length,
      suspiciousScores: [],
      patterns: [],
      recommendations: []
    };

    // Validera varje poängpost och samla misstänkta
    for (const score of scores) {
      const validation = validateScore({
        name: score.name,
        points: score.points,
        level: score.level,
        lines: score.lines,
        gameDuration: score.gameDuration,
        gameSeed: score.gameSeed
      });

      if (!validation.isValid) {
        analysis.suspiciousScores.push({
          id: score._id,
          name: score.name,
          score: score.points,
          reason: validation.reason,
          createdAt: score.createdAt
        });
      }
    }

    // Gruppanalys per spelare för att hitta mönster
    const players = [...new Set(scores.map(s => s.name))];
    for (const player of players) {
      const playerScores = scores.filter(s => s.name === player);
      const patternAnalysis = analyzeScorePattern(playerScores);

      if (patternAnalysis.suspicious) {
        analysis.patterns.push({
          player,
          reasons: patternAnalysis.reasons,
          scoreCount: playerScores.length
        });
      }
    }

    res.json(analysis);
  } catch (err) {
    console.error('❌ Error in score analysis:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;


