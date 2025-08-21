import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server-mongo.js';
import Score from '../models/Score.js';
import { generateGameSeed, validateScore, calculateExpectedScore } from '../utils/scoreCalculator.js';

/**
 * API-tester för Tetris backend
 * 
 * Denna fil innehåller omfattande tester för alla backend-endpoints:
 * - Hälsokontroll: Verifierar att servern svarar korrekt
 * - Spel-seed: Testar generering av unika spel-identifierare
 * - Poängvalidering: Kontrollerar att inskickade poäng är giltiga
 * - Poänghantering: Testar sparande, hämtning och radering av poäng
 * - Admin-funktioner: Verifierar analysverktyg för misstänkta poäng
 * - Säkerhet: Testar hastighetsbegränsning och felhantering
 */

// Sätt testmiljö och anslut till testdatabas
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/tetris-test';

describe('API-tester', () => {
  // Testvariabler som används i alla tester
  let testServer;        // Express-server instans för tester
  let validGameSeed;     // Giltigt spel-seed som genereras för varje test

  // Körs en gång innan alla tester - sätter upp testmiljön
  beforeAll(async () => {
    // Anslut till testdatabasen
    await mongoose.connect(process.env.MONGODB_URI);
    // Starta en testserver på en slumpmässig port
    testServer = app.listen(0); 
  });

  // Körs en gång efter alla tester - städar upp
  afterAll(async () => {
    // Stäng databasanslutningen
    await mongoose.connection.close();
    // Stäng testservern
    testServer.close();
  });

  // Körs före varje enskilt test - förbereder testdata
  beforeEach(async () => {
    // Rensa alla poäng från databasen för att säkerställa rent testmiljö
    await Score.deleteMany({});
    // Generera ett nytt giltigt spel-seed för varje test
    validGameSeed = generateGameSeed();
  });

  /**
   * HÄLSOKONTROLL-TESTER
   * 
   * Dessa tester verifierar att servern är igång och svarar korrekt.
   * Hälsokontrollen är viktig för att bekräfta att backend-tjänsten fungerar.
   */
  describe('Hälsokontroll-endpoint', () => {
    test('GET /api/health ska returnera serverstatus', async () => {
      // Skicka GET-förfrågan till hälsokontroll-endpointen
      const response = await request(testServer)
        .get('/api/health')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att svaret innehåller all nödvändig information
      expect(response.body).toMatchObject({
        ok: true,                    // Servern ska rapportera att den fungerar
        db: expect.any(String),      // Databasstatus (connected/disconnected)
        timestamp: expect.any(String), // När kontrollen gjordes
        uptime: expect.any(Number),  // Hur länge servern varit igång
        version: '2.0.0',           // Korrekt versionsnummer
        environment: 'test'          // Rätt miljö (test)
      });
    });
  });


  /**
   * SPEL-SEED-TESTER
   * 
   * Dessa tester verifierar funktionaliteten för att generera spel-seeds.
   * Ett spel-seed är en unik identifierare som används för att:
   * - Reproducera exakt samma spel (för debugging)
   * - Verifiera att poäng är legitima
   * - Förhindra fusk genom att kräva giltiga seeds
   */
  describe('Spel-seed-endpoint', () => {
    test('GET /api/game/seed ska returnera giltigt seed', async () => {
      // Hämta ett nytt spel-seed från servern
      const response = await request(testServer)
        .get('/api/game/seed')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att svaret har rätt struktur
      expect(response.body).toMatchObject({
        seed: expect.any(String),      // Seed ska vara en sträng
        timestamp: expect.any(Number), // När seedet genererades
        expiresAt: expect.any(Number)  // När seedet går ut
      });

      // Verifiera att seedet har korrekt format (16 hex-tecken)
      expect(response.body.seed).toMatch(/^[a-f0-9]{16}$/);
      // Verifiera att utgångsdatum är efter genereringstid
      expect(response.body.expiresAt).toBeGreaterThan(response.body.timestamp);
    });

    test('GET /api/game/seed ska returnera olika seeds', async () => {
      // Hämta två seeds i rad
      const response1 = await request(testServer).get('/api/game/seed');
      const response2 = await request(testServer).get('/api/game/seed');

      // Verifiera att seeds är olika (för att säkerställa unikhet)
      expect(response1.body.seed).not.toBe(response2.body.seed);
    });
  });


  /**
   * POÄNGVALIDERING-TESTER
   * 
   * Dessa tester verifierar att poängvalideringen fungerar korrekt.
   * Valideringen kontrollerar att inskickade poäng är:
   * - Rimliga för givna spelparametrar
   * - Följer Tetris-reglerna
   * - Inte är resultat av fusk eller buggar
   */
  describe('Validering av poäng-endpoint', () => {
    test('POST /api/scores/validate ska validera giltig poäng', async () => {
      // Skapa en giltig poäng som borde accepteras
      const validScore = {
        name: 'TestPlayer',           // Giltigt spelarnamn
        points: 1000,                 // Rimlig poäng för nivå 5
        level: 5,                     // Normal nivå
        lines: 20,                    // Rimligt antal rader
        gameSeed: validGameSeed,      // Giltigt spel-seed
        gameDuration: 120000          // 2 minuters speltid
      };

      // Skicka poängen för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(validScore)
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att poängen validerades som giltig
      expect(response.body).toMatchObject({
        isValid: true,                // Poängen ska vara giltig
        expectedScore: expect.any(Number) // Förväntad poäng ska returneras
      });
    });

    test('POST /api/scores/validate ska neka ogiltigt namn', async () => {
      // Skapa en poäng med ogiltigt namn (tom sträng)
      const invalidScore = {
        name: '',                     // Tomt namn - ogiltigt
        points: 1000,                 // Resten av data är giltig
        level: 5,
        lines: 20
      };

      // Skicka för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200); // Validering returnerar alltid 200, även för ogiltiga poäng

      // Verifiera att poängen nekades med rätt anledning
      expect(response.body).toMatchObject({
        isValid: false,               // Poängen ska vara ogiltig
        reason: 'Invalid name'        // Rätt felmeddelande
      });
    });

    test('POST /api/scores/validate ska neka ogiltiga poäng', async () => {
      // Skapa en poäng med negativ poäng (omöjligt)
      const invalidScore = {
        name: 'TestPlayer',            // Giltigt namn
        points: -100,                  // Negativ poäng - ogiltigt
        level: 5,                      // Giltig nivå
        lines: 20                      // Giltigt antal rader
      };

      // Skicka för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      // Verifiera att negativ poäng nekades
      expect(response.body).toMatchObject({
        isValid: false,                // Poängen ska vara ogiltig
        reason: 'Invalid points'        // Rätt felmeddelande
      });
    });

    test('POST /api/scores/validate ska neka ogiltig nivå', async () => {
      // Skapa en poäng med för hög nivå (över gränsen för testmiljö)
      const invalidScore = {
        name: 'TestPlayer',             // Giltigt namn
        points: 1000,                   // Giltig poäng
        level: 25,                      // För hög nivå (max 20 i testmiljö)
        lines: 20                       // Giltigt antal rader
      };

      // Skicka för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      // Verifiera att för hög nivå nekades
      expect(response.body).toMatchObject({
        isValid: false,                 // Poängen ska vara ogiltig
        reason: 'Invalid level'          // Rätt felmeddelande
      });
    });

    test('POST /api/scores/validate ska neka omöjlig poäng', async () => {
      // Skapa en poäng som är omöjligt hög för givna parametrar
      const impossibleScore = {
        name: 'TestPlayer',             // Giltigt namn
        points: 999999,                 // Extremt hög poäng
        level: 1,                       // Låg nivå
        lines: 5,                       // Få rader
        gameSeed: validGameSeed         // Giltigt seed
      };

      // Skicka för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(impossibleScore)
        .expect(200);

      // Verifiera att omöjlig poäng nekades
      expect(response.body).toMatchObject({
        isValid: false,                 // Poängen ska vara ogiltig
        reason: expect.stringContaining('Score too high') // Ska innehålla rätt felmeddelande
      });
    });

    test('POST /api/scores/validate ska neka ogiltigt game seed', async () => {
      // Skapa en poäng med ogiltigt spel-seed format
      const invalidScore = {
        name: 'TestPlayer',              // Giltigt namn
        points: 1000,                    // Giltig poäng
        level: 5,                        // Giltig nivå
        lines: 20,                       // Giltigt antal rader
        gameSeed: 'invalid-seed'         // Ogiltigt seed-format
      };

      // Skicka för validering
      const response = await request(testServer)
        .post('/api/scores/validate')
        .send(invalidScore)
        .expect(200);

      // Verifiera att ogiltigt seed nekades
      expect(response.body).toMatchObject({
        isValid: false,                  // Poängen ska vara ogiltig
        reason: 'Invalid game seed'       // Rätt felmeddelande
      });
    });
  });


  /**
   * POÄNGINNSKICK-TESTER
   * 
   * Dessa tester verifierar att poäng kan sparas i databasen.
   * De kontrollerar både lyckade inskickningar och felhantering
   * för ogiltiga eller misstänkta poäng.
   */
  describe('Inskick av poäng-endpoint', () => {
    test('POST /api/scores ska acceptera giltig poäng', async () => {
      // Skapa en giltig poäng som ska sparas
      const validScore = {
        name: 'TestPlayer',             // Giltigt spelarnamn
        points: 1000,                   // Rimlig poäng
        level: 5,                       // Normal nivå
        lines: 20,                      // Rimligt antal rader
        gameSeed: validGameSeed,        // Giltigt spel-seed
        gameDuration: 120000            // 2 minuters speltid
      };

      // Skicka poängen för att sparas
      const response = await request(testServer)
        .post('/api/scores')
        .send(validScore)
        .expect(201); // Förvänta HTTP 201 Created

      // Verifiera att servern bekräftade att poängen sparades
      expect(response.body).toMatchObject({
        ok: true,                       // Operationen lyckades
        id: expect.any(String),         // Unikt ID för poängen
        message: 'Score saved successfully', // Bekräftelsemeddelande
        expectedScore: expect.any(Number)   // Förväntad poäng från validering
      });

      // Verifiera att poängen faktiskt sparades i databasen
      const savedScore = await Score.findById(response.body.id);
      expect(savedScore).toBeTruthy();                    // Poängen ska finnas
      expect(savedScore.name).toBe('TestPlayer');         // Rätt namn
      expect(savedScore.points).toBe(1000);               // Rätt poäng
      expect(savedScore.gameSeed).toBe(validGameSeed);    // Rätt seed
      expect(savedScore.gameDuration).toBe(120000);       // Rätt speltid
      expect(savedScore.clientIP).toBeTruthy();           // IP-adress ska sparas
      expect(savedScore.userAgent).toBeTruthy();          // User-Agent ska sparas
    });

    test('POST /api/scores ska neka ogiltig poäng', async () => {
      // Skapa en poäng med flera ogiltiga fält
      const invalidScore = {
        name: '',                        // Tomt namn - ogiltigt
        points: -100,                    // Negativ poäng - ogiltigt
        level: 25,                       // För hög nivå - ogiltigt
        lines: -5                        // Negativt antal rader - ogiltigt
      };

      // Försök spara den ogiltiga poängen
      const response = await request(testServer)
        .post('/api/scores')
        .send(invalidScore)
        .expect(400); // Förvänta HTTP 400 Bad Request

      // Verifiera att servern nekade poängen
      expect(response.body).toMatchObject({
        error: 'Score validation failed', // Rätt feltyp
        reason: expect.any(String)        // Ska ha en anledning (vilken som helst)
      });
    });

    test('POST /api/scores ska neka omöjlig poäng', async () => {
      // Skapa en poäng som är omöjligt hög för givna parametrar
      const impossibleScore = {
        name: 'TestPlayer',              // Giltigt namn
        points: 999999,                  // Extremt hög poäng (omöjligt för nivå 1)
        level: 1,                        // Låg nivå
        lines: 5,                        // Få rader
        gameSeed: validGameSeed          // Giltigt seed
      };

      // Försök spara den omöjliga poängen
      const response = await request(testServer)
        .post('/api/scores')
        .send(impossibleScore)
        .expect(400); // Förvänta HTTP 400 Bad Request

      // Verifiera att servern nekade poängen med rätt felmeddelande
      expect(response.body).toMatchObject({
        error: 'Score validation failed',                    // Rätt feltyp
        reason: 'Score too high. Expected: ~100, Got: 999999' // Detaljerad anledning
      });
    });

    test('POST /api/scores ska hantera saknade valfria fält', async () => {
      // Skapa en poäng med endast obligatoriska fält (utan valfria)
      const minimalScore = {
        name: 'TestPlayer',              // Obligatoriskt
        points: 1000,                    // Obligatoriskt
        level: 5,                        // Obligatoriskt
        lines: 20                        // Obligatoriskt
        // gameSeed och gameDuration saknas (valfria)
      };

      // Försök spara den minimala poängen
      const response = await request(testServer)
        .post('/api/scores')
        .send(minimalScore)
        .expect(201); // Förvänta HTTP 201 Created

      // Verifiera att poängen sparades
      expect(response.body.ok).toBe(true);

      // Kontrollera att valfria fält är null i databasen
      const savedScore = await Score.findById(response.body.id);
      expect(savedScore.gameSeed).toBeNull();      // Valfritt fält ska vara null
      expect(savedScore.gameDuration).toBeNull();  // Valfritt fält ska vara null
    });

    test('POST /api/scores ska upptäcka misstänkta mönster', async () => {
      // Först, spara en normal poäng för samma spelare
      const normalScore = {
        name: 'TestPlayer',              // Samma spelare
        points: 1000,                    // Normal poäng
        level: 5,                        // Normal nivå
        lines: 20,                       // Normalt antal rader
        gameSeed: validGameSeed          // Giltigt seed
      };

      // Spara den normala poängen
      await request(testServer)
        .post('/api/scores')
        .send(normalScore)
        .expect(201);

      // Sedan, försök spara en misstänkt poäng (stort hopp)
      const suspiciousScore = {
        name: 'TestPlayer',              // Samma spelare
        points: 100000,                  // Extremt hög poäng (100x högre)
        level: 6,                        // Bara en nivå högre
        lines: 25,                       // Bara 5 rader mer
        gameSeed: generateGameSeed()     // Nytt seed
      };

      // Försök spara den misstänkta poängen
      const response = await request(testServer)
        .post('/api/scores')
        .send(suspiciousScore)
        .expect(400); // Förvänta HTTP 400 Bad Request

      // Verifiera att misstänkt mönster upptäcktes
      expect(response.body).toMatchObject({
        error: expect.stringContaining('Suspicious') // Ska innehålla "Suspicious" i felmeddelandet
      });
    });
  });


  /**
   * POÄNGHÄMTNING-TESTER
   * 
   * Dessa tester verifierar att poäng kan hämtas från databasen.
   * De kontrollerar både topplistor och paginerade resultat,
   * samt att parametrar som limit och paginering fungerar korrekt.
   */
  describe('Hämtningsendpoints för poäng', () => {
    // Förbereder testdata före varje test i denna grupp
    beforeEach(async () => {
      // Skapa tre testpoäng med olika värden för att testa sortering
      const scores = [
        { name: 'Player1', points: 5000, level: 10, lines: 50, gameSeed: validGameSeed }, // Högsta poäng
        { name: 'Player2', points: 3000, level: 8, lines: 30, gameSeed: validGameSeed },  // Mellanpoäng
        { name: 'Player3', points: 1000, level: 5, lines: 20, gameSeed: validGameSeed }   // Lägsta poäng
      ];

      // Spara alla poäng i databasen
      for (const score of scores) {
        await Score.create(score);
      }
    });

    test('GET /api/scores/top ska returnera toppresultat', async () => {
      // Hämta topp 5 poäng från servern
      const response = await request(testServer)
        .get('/api/scores/top?limit=5')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att svaret är en array med rätt antal poäng
      expect(Array.isArray(response.body)).toBe(true);     // Ska vara en array
      expect(response.body.length).toBe(3);                // Ska innehålla alla 3 poäng
      expect(response.body[0].points).toBe(5000);          // Högsta poängen först
      expect(response.body[0].name).toBe('Player1');       // Rätt spelare på första plats
    });

    test('GET /api/scores/top ska respektera limit-parametern', async () => {
      // Hämta endast 2 topppoäng (begränsa resultatet)
      const response = await request(testServer)
        .get('/api/scores/top?limit=2')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att endast 2 poäng returnerades
      expect(response.body.length).toBe(2);
    });

    test('GET /api/scores ska returnera paginerade resultat', async () => {
      // Hämta första sidan med 2 poäng per sida
      const response = await request(testServer)
        .get('/api/scores?page=1&size=2')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att pagineringsinformation är korrekt
      expect(response.body).toMatchObject({
        page: 1,                        // Aktuell sida
        size: 2,                        // Poäng per sida
        total: 3,                       // Totalt antal poäng
        items: expect.any(Array)        // Array med poäng
      });
      expect(response.body.items.length).toBe(2); // Endast 2 poäng på första sidan
    });

    test('GET /api/scores ska hantera ogiltig paginering', async () => {
      // Testa med ogiltiga pagineringsparametrar (sida 0, för stor storlek)
      const response = await request(testServer)
        .get('/api/scores?page=0&size=1000')
        .expect(200); // Förvänta HTTP 200 OK (servern korrigerar automatiskt)

      // Verifiera att servern korrigerade de ogiltiga parametrarna
      expect(response.body.page).toBe(1);   // Sida 0 korrigerades till 1
      expect(response.body.size).toBe(100); // Storlek 1000 korrigerades till max 100
    });
  });


  /**
   * POÄNGRADERING-TESTER
   * 
   * Dessa tester verifierar att poäng kan raderas från databasen.
   * De kontrollerar både lyckade raderingar och felhantering
   * för icke-existerande eller ogiltiga ID:n.
   */
  describe('Radering av poäng-endpoint', () => {
    let scoreId; // Variabel för att lagra ID på poängen som ska raderas

    // Förbereder en poäng som ska raderas före varje test
    beforeEach(async () => {
      // Skapa en testpoäng som ska raderas
      const score = await Score.create({
        name: 'TestPlayer',              // Testspelare
        points: 1000,                    // Testpoäng
        level: 5,                        // Testnivå
        lines: 20,                       // Testrader
        gameSeed: validGameSeed          // Giltigt seed
      });
      scoreId = score._id; // Spara ID:t för senare användning
    });

    test('DELETE /api/scores/:id ska radera befintlig poäng', async () => {
      // Försök radera poängen med det förberedda ID:t
      const response = await request(testServer)
        .delete(`/api/scores/${scoreId}`)
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att servern bekräftade raderingen
      expect(response.body).toMatchObject({
        ok: true,                        // Operationen lyckades
        deleted: 1,                      // En poäng raderades
        message: 'Score deleted successfully' // Bekräftelsemeddelande
      });

      // Verifiera att poängen faktiskt raderades från databasen
      const deletedScore = await Score.findById(scoreId);
      expect(deletedScore).toBeNull(); // Poängen ska inte längre finnas
    });

    test('DELETE /api/scores/:id ska hantera icke-existerande poäng', async () => {
      // Skapa ett ID som inte finns i databasen
      const fakeId = new mongoose.Types.ObjectId();
      
      // Försök radera en icke-existerande poäng
      const response = await request(testServer)
        .delete(`/api/scores/${fakeId}`)
        .expect(404); // Förvänta HTTP 404 Not Found

      // Verifiera att rätt felmeddelande returneras
      expect(response.body).toMatchObject({
        error: 'Score not found' // Ska rapportera att poängen inte hittades
      });
    });

    test('DELETE /api/scores/:id ska hantera ogiltigt ID-format', async () => {
      // Försök radera med ett ogiltigt ID-format (inte ett MongoDB ObjectId)
      const response = await request(testServer)
        .delete('/api/scores/invalid-id')
        .expect(400); // Förvänta HTTP 400 Bad Request

      // Verifiera att rätt felmeddelande returneras
      expect(response.body).toMatchObject({
        error: 'Invalid score ID' // Ska rapportera att ID-formatet är ogiltigt
      });
    });
  });


  /**
   * ADMIN-ANALYS-TESTER
   * 
   * Dessa tester verifierar admin-funktionerna för att analysera poäng.
   * De kontrollerar att systemet kan identifiera misstänkta mönster
   * och ge rekommendationer för administratörer.
   */
  describe('Admin-analys-endpoint', () => {
    // Förbereder testdata med både normala och misstänkta poäng
    beforeEach(async () => {
      // Skapa en blandning av normala och misstänkta poäng för analys
      const scores = [
        { name: 'Player1', points: 1000, level: 5, lines: 20, gameSeed: validGameSeed },           // Normal poäng
        { name: 'Player1', points: 50000, level: 6, lines: 25, gameSeed: generateGameSeed() },     // Misstänkt hög poäng
        { name: 'Player2', points: 2000, level: 8, lines: 30, gameSeed: validGameSeed }            // Normal poäng
      ];

      // Spara alla poäng i databasen
      for (const score of scores) {
        await Score.create(score);
      }
    });

    test('GET /admin/scores/analysis ska returnera analys', async () => {
      // Hämta analys av alla poäng i systemet
      const response = await request(testServer)
        .get('/admin/scores/analysis')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att analysen innehåller all nödvändig information
      expect(response.body).toMatchObject({
        totalScores: 3,                   // Totalt antal poäng
        suspiciousScores: expect.any(Array), // Array med misstänkta poäng
        patterns: expect.any(Array),      // Array med identifierade mönster
        recommendations: expect.any(Array)   // Array med rekommendationer
      });
    });

    test('GET /admin/scores/analysis ska filtrera på spelarens namn', async () => {
      // Hämta analys endast för en specifik spelare
      const response = await request(testServer)
        .get('/admin/scores/analysis?playerName=Player1')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att endast Player1:s poäng analyserades
      expect(response.body.totalScores).toBe(2); // Player1 har 2 poäng
    });

    test('GET /admin/scores/analysis ska respektera limit-parametern', async () => {
      // Begränsa analysen till endast 1 poäng
      const response = await request(testServer)
        .get('/admin/scores/analysis?limit=1')
        .expect(200); // Förvänta HTTP 200 OK

      // Verifiera att analysen begränsades till 1 poäng
      expect(response.body.totalScores).toBe(1);
    });
  });


  /**
   * HASTIGHETSBEGRÄNSNING-TESTER
   * 
   * Dessa tester verifierar att hastighetsbegränsning (rate limiting) fungerar.
   * De säkerställer att systemet kan hantera snabba upprepade förfrågningar
   * utan att bli överbelastat och att fusk förhindras.
   */
  describe('Hastighetsbegränsning', () => {
    test('Ska begränsa snabba förfrågningar', async () => {
      // Skapa 15 samtidiga förfrågningar till hälsokontroll-endpointen
      const requests = Array(15).fill().map(() => 
        request(testServer).get('/api/health')
      );

      // Skicka alla förfrågningar samtidigt
      const responses = await Promise.all(requests);
      
      // Räkna antal lyckade (200) och begränsade (429) förfrågningar
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      // Verifiera att både lyckade och begränsade förfrågningar finns
      expect(successCount).toBeGreaterThan(0);    // Några ska lyckas
      expect(rateLimitedCount).toBeGreaterThan(0); // Några ska begränsas
    });

    test('Ska begränsa inskick av poäng', async () => {
      // Skapa en giltig poäng som ska användas för testet
      const validScore = {
        name: 'TestPlayer',               // Giltigt namn
        points: 1000,                     // Giltig poäng
        level: 5,                         // Giltig nivå
        lines: 20,                        // Giltigt antal rader
        gameSeed: validGameSeed           // Giltigt seed
      };

      // Skapa 15 samtidiga förfrågningar för att spara samma poäng
      const requests = Array(15).fill().map(() => 
        request(testServer).post('/api/scores').send(validScore)
      );

      // Skicka alla förfrågningar samtidigt
      const responses = await Promise.all(requests);
      
      // Räkna antal lyckade (201) och begränsade (429) förfrågningar
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      // Verifiera att både lyckade och begränsade förfrågningar finns
      expect(successCount).toBeGreaterThan(0);    // Några ska lyckas sparas
      expect(rateLimitedCount).toBeGreaterThan(0); // Några ska begränsas
    });
  });


  /**
   * FELHANTERING-TESTER
   * 
   * Dessa tester verifierar att systemet hanterar fel korrekt.
   * De kontrollerar beteendet vid ogiltig JSON, saknade fält,
   * icke-existerande endpoints och andra felaktiga förfrågningar.
   */
  describe('Felhantering', () => {
    test('Ska hantera felaktig JSON', async () => {
      // Skicka en förfrågan med ogiltig JSON-syntax
      const response = await request(testServer)
        .post('/api/scores')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}') // Ogiltig JSON (saknar citattecken)
        .expect(400); // Förvänta HTTP 400 Bad Request
    });

    test('Ska hantera saknade obligatoriska fält', async () => {
      // Skicka en förfrågan utan några fält (tomt objekt)
      const response = await request(testServer)
        .post('/api/scores')
        .send({}) // Tomt objekt - saknar alla obligatoriska fält
        .expect(400); // Förvänta HTTP 400 Bad Request

      // Verifiera att rätt felmeddelande returneras
      expect(response.body).toMatchObject({
        error: 'Score validation failed' // Ska rapportera valideringsfel
      });
    });

    test('Ska hantera icke-existerande endpoints', async () => {
      // Försök anropa en endpoint som inte finns
      const response = await request(testServer)
        .get('/api/nonexistent') // Endpoint som inte existerar
        .expect(404); // Förvänta HTTP 404 Not Found

      // Verifiera att rätt felmeddelande returneras
      expect(response.body).toMatchObject({
        error: 'Endpoint not found' // Ska rapportera att endpoint saknas
      });
    });
  });
});
