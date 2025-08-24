import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 16
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  lines: {
    type: Number,
    required: true,
    min: 0
  },
  gameDuration: {
    type: Number,
    default: 0
  },
  gameSeed: {
    type: String,
    default: null
  },
  clientIP: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'scores'
});

// Index för snabb sökning på poäng
scoreSchema.index({ points: -1, createdAt: 1 });

// Index för namn
scoreSchema.index({ name: 1 });

const Score = mongoose.model('Score', scoreSchema);

export default Score;
