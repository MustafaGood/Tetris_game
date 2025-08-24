import { Router } from "express";
import Score from "../models/ScoreMongo.js";

const router = Router();

// Hälsokontroll för API och databasanslutning
router.get("/health", async (_req, res) => {
  try {
    const dbState = Score.db.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    
    res.json({
      ok: true,
      db: states[dbState] || "unknown",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "2.0.0",
      environment: process.env.NODE_ENV || "development",
      database: "MongoDB Atlas"
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({ ok: false, error: 'Health check failed' });
  }
});

// Hämta topplista
router.get("/scores/top", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10'), 100);
    
    const scores = await Score.find()
      .sort({ points: -1, createdAt: 1 })
      .limit(limit)
      .lean();
    
    console.log(`📊 Hämtade ${scores.length} top-poäng från MongoDB`);
    res.json({
      ok: true,
      data: scores
    });
  } catch (error) {
    console.error('❌ Error fetching top scores:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch scores',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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

    res.json({ 
      page, 
      size, 
      total, 
      items: scores 
    });
  } catch (error) {
    console.error('❌ Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Skapa ny poängpost
router.post("/scores", async (req, res) => {
  try {
    const { name, points, level, lines, gameDuration, gameSeed } = req.body || {};

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

    const sanitizedName = String(name).trim().slice(0, 16);

    const score = new Score({
      name: sanitizedName,
      points: Math.floor(points),
      level: Math.floor(level),
      lines: Math.floor(lines),
      gameDuration: gameDuration || 0,
      gameSeed: gameSeed || null
    });

    const savedScore = await score.save();
    
    console.log(`💾 Poäng sparad i MongoDB: ${sanitizedName} - ${points} poäng (ID: ${savedScore._id})`);
    
    res.status(201).json({
      ok: true,
      data: {
        id: savedScore._id,
        message: 'Poäng sparades i MongoDB'
      }
    });
  } catch (error) {
    console.error('❌ Error saving score:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to save score',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Ta bort poäng
router.delete("/scores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        ok: false,
        error: 'ID krävs' 
      });
    }
    
    const result = await Score.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ 
        ok: false,
        error: 'Poängen hittades inte' 
      });
    }

    console.log(`🗑️ Poäng raderad från MongoDB: ID ${id}`);
    res.json({ 
      ok: true, 
      data: {
        deleted: 1,
        message: 'Poäng raderades från MongoDB'
      }
    });
  } catch (error) {
    console.error('❌ Error deleting score:', error);
    res.status(500).json({ 
      ok: false,
      error: 'Failed to delete score' 
    });
  }
});

// Statistik
router.get("/stats", async (req, res) => {
  try {
    const [totalScores, highestScoreDoc, averageScoreAgg] = await Promise.all([
      Score.countDocuments(),
      Score.findOne().sort({ points: -1 }).lean(),
      Score.aggregate([
        { $group: { _id: null, avg: { $avg: "$points" } } }
      ])
    ]);

    const averageScore = averageScoreAgg && averageScoreAgg[0] ? Math.round(averageScoreAgg[0].avg) : 0;
    
    res.json({ 
      ok: true, 
      data: { 
        totalScores, 
        highestScore: highestScoreDoc ? highestScoreDoc.points : 0, 
        averageScore 
      } 
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

export default router;
