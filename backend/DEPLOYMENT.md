# Distribution och driftsättning — Tetris backend (SQLite)

<!-- Kommentar: Denna fil beskriver hur backend tjänsten distribueras och vilka miljövariabler som krävs. Håll instruktionerna korta och konkreta. -->

## Förutsättningar

- Node.js 16+ installerat
- En hosting-leverantör (t.ex. Railway eller Render)
- Git tillgängligt lokalt

## Miljövariabler

<!-- Kommentar: Definiera obligatoriska och valfria variabler här — de används av servern vid start. -->

### Obligatoriska

| Variabel | Beskrivning | Exempel |
|---------:|-------------|--------|
| `NODE_ENV` | Körningsläge | `production` |
| `PORT` | Port som servern lyssnar på | `3001` |
| `CORS_ORIGIN` | Tillåten frontend-origin | `https://example.com` |
| `DB_PATH` | Sökväg till SQLite-databas | `./tetris.db` |

### Valfria (vanliga)

| Variabel | Beskrivning | Standard |
|---------:|-------------|--------:|
| `RATE_LIMIT_WINDOW_MS` | Tidsfönster för rate-limiter | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max antal förfrågningar per fönster | `100` |
| `SCORE_LIMIT_WINDOW_MS` | Fönster för poänginlämning | `60000` (1 min) |
| `SCORE_LIMIT_MAX_REQUESTS` | Max poänginlämningar per fönster | `10` |
| `GAME_SEED_EXPIRY_MS` | Expiration för spel-seed | `300000` (5 min) |
| `SCORE_TOLERANCE_PERCENT` | Tolerance vid validering av poäng | `30` |
| `LOG_LEVEL` | Loggningsnivå (`info`, `debug`, `error`) | `info` |

## Distribution med Railway

<!-- Kommentar: Snabbguide för att köra via Railway CLI. Behåll kommandon oförändrade. -->

1. Installera Railway CLI (om du inte redan gjort det):

```bash
npm install -g @railway/cli
```

2. Logga in:

```bash
railway login
```

3. Initiera projektet i backend-katalogen:

```bash
cd backend
railway init
```

4. Sätt nödvändiga miljövariabler (exempel):

```bash
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
railway variables set DB_PATH="./tetris.db"
```

5. Distribuera:

```bash
railway up
```

6. Hämta din deployment-URL:

```bash
railway domain
```

## Distribution med Render

1. Gå till https://dashboard.render.com och skapa en ny Web Service.
2. Anslut ditt Git-repo och konfigurera service:

- Namn: `tetris-backend`
- Miljö: `Node`
- Build command: `npm install`
- Start command: `node server.js`
- Health check path: `/api/health`

3. Lägg till miljövariabler i Render-dashboarden (exempel):

```
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
DB_PATH=./tetris.db
```

4. Klicka "Create Web Service" för att deploya.

## Databas (SQLite) — praktiska anteckningar

- SQLite är filbaserat; ange `DB_PATH` korrekt.
- Om filen inte finns skapas den vanligtvis vid första start.
- För backup: stäng av servern innan du kopierar `tetris.db` för att undvika korruption.

<!-- Kommentar: För produktion överväg att använda extern databas om skalbarhet krävs. -->

## Hälsokontroll

Servern bör svara på följande endpoint för health checks:

```http
GET /api/health
```

Exempel på ett förväntat JSON-svar:

```json
{
   "ok": true,
   "db": "connected",
   "timestamp": "2024-01-20T10:30:00.000Z",
   "uptime": 123.45,
   "version": "2.0.0",
   "environment": "production"
}
```

## Felsökning

Vanliga problem och snabba åtgärder:

1) Databasbehörigheter
- Kontrollera att processen har läs/skriv-rättigheter till `DB_PATH`.
- På Render/Railway använd persistenta diskar eller mounts om databasen ska bevaras mellan deploys.

2) CORS-fel
- Kontrollera att `CORS_ORIGIN` innehåller frontend-domänen.
- För flera origin, hantera dem i backenden (lista eller regex).

3) Rate limiting
- Justera `RATE_LIMIT_*`-variabler vid falska träffar.
- Granska loggar för att se vilka IP:er som blockas.

4) Portproblem
- Plattformar som Railway/Render sätter ofta `PORT` automatiskt. Läs deras dokumentation om du får portfel.

### Loggar

```bash
# Railway
railway logs

# Render
# Se loggar i Render dashboard
```

## Säkerhet och validering

- Rate limiting och input-validering är aktiverade.
- CORS och Helmet används för att reducera attackytan.
- Anti-cheat och score-validering skyddar mot uppenbara fuskförsök.
- Validera miljövariabler vid uppstart och fail-fastsätt vid kritiska fel.

## Övervakning

- Använd leverantörens inbyggda övervakning och logghantering.
- Anropa health check regelbundet från din övervakningstjänst.
- Sätt upp alerts vid oacceptabla felnivåer eller ökad latens.

## Uppdatera deployment

<!-- Kommentar: Uppdateringar görs genom att pusha till repositoryt och trigga ny deploy. -->

```bash
# Railway
git push origin main
railway up

# Render
git push origin main
# Om auto-deploy är aktiverat så deployas koden automatiskt
```

<!-- Kommentar: Om du behöver migrera data eller göra större ändringar, skapa ett separat underlag (RUNBOOK) och testa i staging först. -->
