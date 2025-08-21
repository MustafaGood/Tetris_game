#!/usr/bin/env node
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

/*
 Syfte: Komplettera och normalisera fält i kollektionen "scores" i MongoDB.
  - Fyller i name från player om name saknas och tar bort player
  - Fyller i points från score om points saknas och tar bort score
  - Normaliserar numeriska fält (points, level, lines) till heltal med standardvärden

 Förutsätter: MONGODB_URI i miljövariablerna.
*/

// Läs in variabler från .env
dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI saknas. Ange den innan du kör skriptet.');
  process.exit(1);
}

// Hämtar databasnamn från MONGODB_URI; faller tillbaka på "tetris_game" vid fel
const dbNameFromUri = () => {
  try {
    const afterNet = mongoUri.split('.net/')[1] || '';
    const beforeParams = afterNet.split('?')[0] || '';
    return beforeParams || 'tetris_game';
  } catch {
    return 'tetris_game';
  }
};

// Huvudkörning: anslut, komplettera fält och normalisera värden
const run = async () => {
  const client = new MongoClient(mongoUri);
  try {
    console.log('🔌 Ansluter till MongoDB...');
    await client.connect();
    const dbName = dbNameFromUri();
    const db = client.db(dbName);
    const scores = db.collection('scores');

    // Steg 1: Fyll i name från player där name saknas, ta bort player
    console.log("🧼 Fyller i fältet 'name' från 'player' om det saknas...");
    const nameRes = await scores.updateMany(
      { $and: [ { $or: [ { name: { $exists: false } }, { name: '' } ] }, { player: { $exists: true } } ] },
      [ { $set: { name: '$player' } }, { $unset: 'player' } ]
    );
    console.log(`✅ name ifyllt: matchade ${nameRes.matchedCount}, ändrade ${nameRes.modifiedCount}`);

    // Steg 2: Fyll i points från score där points saknas, ta bort score
    console.log("🧼 Fyller i 'points' från 'score' om det saknas...");
    const pointsRes = await scores.updateMany(
      { $and: [ { $or: [ { points: { $exists: false } }, { points: null } ] }, { score: { $exists: true } } ] },
      [ { $set: { points: '$score' } }, { $unset: 'score' } ]
    );
    console.log(`✅ points ifyllt: matchade ${pointsRes.matchedCount}, ändrade ${pointsRes.modifiedCount}`);

    // Steg 3: Normalisera numeriska fält till heltal med rimliga standardvärden
    console.log('🔢 Normaliserar numeriska fält (points, level, lines)...');
    const normalizeRes = await scores.updateMany(
      {},
      [
        { $set: {
          points: { $toInt: { $ifNull: ['$points', 0] } },
          level: { $toInt: { $ifNull: ['$level', 1] } },
          lines: { $toInt: { $ifNull: ['$lines', 0] } }
        } }
      ]
    );
    console.log(`✅ normaliserat: matchade ${normalizeRes.matchedCount}, ändrade ${normalizeRes.modifiedCount}`);

    console.log('🎉 Komplettering slutförd.');
  } catch (err) {
    console.error('❌ Kompletteringen misslyckades:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
};

run();


