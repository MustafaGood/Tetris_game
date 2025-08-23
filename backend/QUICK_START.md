# Tetris Backend - Quick Start Guide

## Förutsättningar

- Node.js 16+ installerat
- Git

## Snabbstart

### 1. Installera beroenden
```bash
# Gå till backend-mappen
cd backend

# Installera alla backend-beroenden
npm install
```

### 2. Konfigurera miljövariabler
Skapa en `.env`-fil i backend-mappen:
```env
# Miljö (development/production)
NODE_ENV=development

# Port som API-servern lyssnar på
PORT=3001

# Tillåten origin för frontend-utvecklingsservern (Vite)
CORS_ORIGIN=http://localhost:3000
```

### 3. Starta backend-servern
```bash
# Startar Express-servern på angiven PORT
npm start
```

## Testa API:et

### Health check
```bash
# Verifiera att servern svarar och att databasen är ansluten
curl http://localhost:3001/api/health
```

### Generera game seed
```bash
# Hämtar ett seed som kan användas för klientside-validering
curl http://localhost:3001/api/game/seed
```

### Hämta topplista
```bash
# Hämtar toppresultat, kan begränsas med ?limit=10
curl "http://localhost:3001/api/scores/top?limit=10"
```

## Kör tester

```bash
# Kör alla tester (Jest/Vitest beroende på konfiguration)
npm test

# Watch mode för kontinuerlig testkörning
npm run test:watch

# Kör tester med kodtäckning
npm run test:coverage
```

## Utveckling

### Starta i utvecklingsläge
```bash
# Startar servern med automatisk omstart vid kodändring (nodemon)
npm run dev
```

### Loggar
Servern loggar inkommande requests, fel och anti-cheat-relaterade händelser med tydliga nivåer.

## Deployment

### Railway
```bash
# Distribuera backend till Railway (kräver inloggning och projektkonfiguration)
railway up
```

### Render
Push till main-branch aktiverar auto-deploy om det är konfigurerat.

## Frontend-anslutning (översikt)

Frontend-projektet finns i mappen `frontend/` och använder Vite som utvecklingsserver.
Konfigurera anslutningen till backend genom att sätta `VITE_API_BASE` i `frontend/.env`.

```bash
# I frontend-mappen: konfigurera bas-URL till backend-API
echo "VITE_API_BASE=http://localhost:3001" > .env

# Starta frontend-utvecklingsservern
npm run dev

# Frontend körs som standard på http://localhost:3000
# Kontrollera att CORS_ORIGIN i backend/.env matchar denna URL
```



## API Endpoints

| Method | Endpoint | Beskrivning |
|--------|----------|-------------|
| GET | `/api/health` | Serverstatus och databasanslutning |
| POST | `/api/scores` | Spara nytt resultat |
| GET | `/api/scores/top` | Topplista |
| GET | `/api/scores` | Alla resultat (paginering) |
| DELETE | `/api/scores/:id` | Ta bort resultat |

## Säkerhet

- **Rate limiting:** via reverse proxy eller middleware (valfritt)
- **CORS:** konfigurerad för säker kommunikation mellan domäner
- **Helmet:** säkerhetsrelaterade HTTP-headers
- **Inputvalidering:** omfattande validering på alla endpoints

## Felsökning

### Vanliga problem

1. Port redan använd
   - Ändra `PORT` i `.env`
   - Stoppa andra processer som använder porten
   - Verifiera brandvägg/nätverksåtkomst

2. CORS-fel
   - Kontrollera `CORS_ORIGIN` i `.env`
   - Verifiera att den matchar frontend-URL:en

### Loggar
Fel och varningar loggas i konsolen med tydliga nivåer (info, warn, error).

---

Lycka till med utvecklingen och körningen av Tetris-backenden.
