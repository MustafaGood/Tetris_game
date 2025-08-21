import mongoose from 'mongoose';

// Mongoose-modell som representerar ett spelresultat (Score)
// Innehåller valideringsregler och index för effektiv hämtning av topplistor

const scoreSchema = new mongoose.Schema({
  // Spelarens namn (trimmas, max 16 tecken)
  name: { type: String, required: true, trim: true, maxlength: 16 },

  // Poäng (icke-negativt heltal)
  points: { type: Number, required: true, min: 0 },

  // Nivå (min 1). I utvecklingsläge tillåts upp till 99, annars 20
  level: { type: Number, required: true, min: 1, max: process.env.NODE_ENV === 'development' ? 99 : 20 },

  // Antal rader (icke-negativt heltal)
  lines: { type: Number, required: true, min: 0 },

  // Speltid i sekunder (valfritt, icke-negativt)
  gameDuration: { type: Number, required: false, min: 0 }, 

  // Slumptalsfrö för reproducerbara spel (valfritt)
  gameSeed: { type: String, required: false },

  // Hash för enkel resultatintegritetskontroll/sammanlänkning (valfritt, indexerat)
  scoreHash: { type: String, required: false, index: true }, 

  // Klientens IP-adress (valfritt)
  clientIP: { type: String, required: false }, 

  // Webbläsarens user agent-sträng (valfritt)
  userAgent: { type: String, required: false },

  // Tidpunkt när resultatet skapades
  createdAt: { type: Date, default: Date.now }
});

// Kompositindex: sortera på högst poäng och därefter skapelsedatum (stigande)
scoreSchema.index({ points: -1, createdAt: 1 });

// Exportera modellen för användning i resten av backend-koden
const Score = mongoose.model('Score', scoreSchema);
export default Score;


