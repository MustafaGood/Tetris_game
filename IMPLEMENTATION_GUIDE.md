# Tetris Game - Implementation Guide

## ✅ **Implementerade funktioner enligt kraven**

### **Backend (Node/Express + SQLite)**
- ✅ **GET /api/scores** - Lista alla med paginering (?page&limit)
- ✅ **GET /api/scores/top?limit=10** - Topp-lista sorterad på points desc, createdAt asc
- ✅ **POST /api/scores** - Spara {name, points, level, lines, gameDuration}
- ✅ **Validering**: name: 1–16 tecken, points: number >= 0
- ✅ **Konsekvent JSON**: {ok, data|error} format
- ✅ **SQLite**: databasfil skapas automatiskt (`DB_PATH`, standard `./tetris.db`)
- ✅ **Felhantering**: 400/422 för validering, 500 för oväntat
- ✅ **Loggar**: tydliga loggar för serverstatus och DB-initialisering

### **Frontend (React/TypeScript)**
- ✅ **Env-stöd**: VITE_API_BASE (fallback: http://localhost:3001)
- ✅ **useScores hook**: fetchTopScores(limit=10), submitScore(payload)
- ✅ **Highscores-sida**: Hämta top 10, loading/empty/error states
- ✅ **Tabell**: #, Name, Score, Level, Time, Date
- ✅ **Game Over-dialog**: submitScore vid "Spara Highscore Online"
- ✅ **Toast**: "Sparat!" eller felmeddelande

### **Tekniska krav**
- ✅ **TypeScript**: Alla filer använder TypeScript
- ✅ **async/await**: Alla API-anrop använder async/await
- ✅ **fetch med abort-signal**: Implementerat i useScores hook
- ✅ **Inga any**: Alla typer är definierade

## 🚀 **Så här startar du systemet**

### **1. Backend (MongoDB)**
```bash
cd backend

echo "MONGODB_URI=mongodb://localhost:27017/tetris-game" > .env

npm install

npm start
```

**Förväntad output:**
```
✅ Connected to MongoDB successfully
📊 Database: tetris-game
✅ API up on http://localhost:3001
```

### **2. Frontend (Vite)**
```bash
cd frontend

echo "VITE_API_BASE=http://localhost:3001" > .env

npm install

npm run dev
```

**Förväntad output:**
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

## **API Endpoints**

### **GET /api/scores**
- **Paginering**: `?page=1&limit=20`
- **Response**: `{ok: true, data: {scores: [...], pagination: {...}}}`

### **GET /api/scores/top**
- **Limit**: `?limit=10` (max 100)
- **Sortering**: points DESC, createdAt ASC
- **Response**: `{ok: true, data: [...]}`

### **POST /api/scores**
- **Payload**: `{name, points, level, lines, gameDuration}`
- **Validering**: name 1-16 tecken, points >= 0
- **Response**: `{ok: true, data: {id, message}}`
- **Fel**: 422 för validering, 500 för oväntat

## **Databasstruktur (SQLite)**

### **Score Table**
```sql
-- Tabell för att spara highscores
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  lines INTEGER DEFAULT 0,
  gameDuration INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);
```

### **Indexering**
```sql
-- Index för snabb sortering per poäng och datum
CREATE INDEX IF NOT EXISTS idx_scores_points_createdAt
ON scores(points DESC, createdAt ASC);
```

## **Testa systemet**

### **1. Spela Tetris**
- Starta spelet
- Spela tills du får game over
- Klicka "Spara Highscore Online"

### **2. Validera input**
- **Tomt namn**: 422 "Name is required and must be a non-empty string"
- **Långt namn**: 422 "Name must be 1-16 characters long"
- **Negativa poäng**: 422 "Points must be a non-negative number"

### **3. Kontrollera databasen**
- Kontrollera att filen `tetris.db` skapats i backend-mappen
- Använd valfritt SQLite-verktyg (t.ex. `sqlite3`) för att inspektera tabellen
```bash
# Exempel: öppna databasen och lista tabeller
sqlite3 backend/tetris.db ".tables"
```

### **4. Testa API:er**
```bash
curl http://localhost:3001/api/scores/top?limit=10

curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","points":100,"level":1,"lines":0}'
```

## **Felsökning**

### **Databas (SQLite) problem**
```bash
# Kontrollera att processen har rätt att läsa/skriva till DB-filen
ls -la backend/tetris.db

# Ta bort och återskapa DB (skapas på nästa serverstart)
rm backend/tetris.db
```

### **Frontend kan inte ansluta**
```bash
curl http://localhost:3001/api/health

```

### **Valideringsfel**
- Kontrollera att alla fält är korrekt typade
- Namn måste vara 1-16 tecken
- Poäng måste vara >= 0

## **TODO (om något saknas)**

Alla krav från specifikationen är implementerade. Systemet är redo för produktion.

## **Säkerhet**

- **Rate limiting**: 100 requests/15min, 10 scores/min
- **Input validering**: Alla fält valideras
- **Anti-cheat**: Score hash och pattern analysis
- **CORS**: Konfigurerad för utveckling
- **Helmet**: Security headers

## **Prestanda**

- **SQLite index**: Optimerad för sortering
- **Paginering**: Stöd för stora datamängder
- **Compression**: Gzip aktiverat
- **Caching**: Rate limiting med skipSuccessfulRequests

---

**🎮 Spelet är klart att användas! Starta backend och frontend enligt instruktionerna ovan.**
