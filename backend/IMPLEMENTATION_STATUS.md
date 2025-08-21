# Tetris Backend - Status (SQLite)

## Aktiv implementation

### API
- `POST /api/scores` – Spara poäng
- `GET /api/scores/top` – Topplista
- `GET /api/scores` – Lista (paginering)
- `DELETE /api/scores/:id` – Ta bort poäng
- `GET /api/health` – Health
- `GET /api/stats` – Statistik

### Backend (server)
<!--
Kommentar: Backend ansvarar för all serverlogik, datalagring och API-endpoints som frontend anropar.
Backend hanterar validering, affärslogik och kommunikation med databasen.
-->
- Fil: `server.js`
- Backend ansvarar för applikationslogik, REST-API och datalagring.
- SQLite-databas initieras automatiskt (fil: `tetris.db`) — används som enkel lokal lagring för poäng och statistik.
- Middleware: Helmet, Compression, CORS, Morgan
- Robust validering, felhantering och tydliga HTTP-svar vid fel.
- Backend exponerar dessa endpoints för frontend: se sektionen "API" ovan.

### Frontend
<!--
Kommentar: Frontend ansvarar för användargränssnittet, rendering av spelet och att kommunicera med backend via API-anrop.
Frontend fokuserar på presentation, användarinteraktion och visning av topplistor/statistik.
-->
- Integration/punkt: `frontend/src/api.ts` — ansvarar för klient-sidans anrop till backend-API:et.
- Frontend implementeras med Vite/React (se `frontend`-mappen). Den ansvarar för:
	- Rendering av spelbrädet och UI-komponenter
	- Hantering av användarens input och spelmekanik (lokalt)
	- Skicka sparade poäng till backend (`POST /api/scores`) och hämta topplistor (`GET /api/scores/top`)
- Körs separat från backend under utveckling; konfigurera `CORS_ORIGIN` så frontend kan anropa backend.

## Användning

```bash
# Installera beroenden och starta servern
cd backend
npm install
npm start
```

Tester:
```bash
npm test
```

Deployment: Konfigurera plattformen att köra `node server.js`.

## Konfiguration

```env
# Miljö och port
NODE_ENV=development
PORT=3001

# Frontend-origin för CORS
CORS_ORIGIN=http://localhost:5173

# SQLite-databasfil
DB_PATH=./tetris.db
```

## Monitoring

- Health check: `/api/health`
- Loggning: Morgan i konsolen

---

Status: SQLite-backend aktiv. Mongo-relaterad kod borttagen.
