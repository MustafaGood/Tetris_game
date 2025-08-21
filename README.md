# Fullstack Tetris Game v2.0.0

Ett komplett och moderniserat Tetris-spel byggt med React, TypeScript, Node.js och SQLite. Spelet innehåller alla klassiska Tetris-funktioner plus en highscore-lista med förbättrad prestanda och säkerhet.

[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Innehållsförteckning

- [Nya Funktioner](#nya-funktioner-i-v200)
- [Funktioner](#funktioner)
- [Teknisk Stack](#teknisk-stack)
- [Installation](#installation)
- [Körning](#körning)
- [Spelkontroller](#spelkontroller)
- [Poängsystem](#poängsystem)
- [Utveckling](#utveckling)
- [Felsökning](#felsökning)
- [Projektstruktur](#projektstruktur)
- [Säkerhet](#säkerhet)
- [Prestanda](#prestanda)
- [Projektplanering](#projektplanering-med-trello)
- [Bidrag](#bidrag)
- [Licens](#licens)

## Nya Funktioner i v2.0.0

### Prestanda & Säkerhet
- **Förbättrad prestanda** med optimerad rendering och state-hantering
- **Förbättrad säkerhet** med Helmet, CORS-konfiguration och input-validering
- **Graceful shutdown** för säker serveravslutning
- **Bättre felhantering** med detaljerade felmeddelanden och återhämtning

- **Glassmorphism-effekter** och custom animations
- **Förbättrad responsivitet** för olika skärmstorlekar

### Utveckling & Kvalitet
- **ESLint-konfiguration** för bättre kodkvalitet
- **Förbättrad TypeScript** med striktare typer och bättre felhantering
- **Statistik-endpoint** för att spåra spelstatistik
- **Comprehensive testing** med Vitest

## Funktioner

### Spelfunktioner
- **Klassisk Tetris-spel** med alla 7 tetromino-former
- **Hold-funktion** för att spara pjäser
- **7-bag system** för balanserad pjäsfördelning
- **Ghost piece** som visar var pjäsen kommer att landa
- **Line clear-animationer** med visuella effekter

### Poäng & Statistik
- **Avancerat poängsystem** med nivåer och rader
- **Highscore-lista** med persistent lagring
- **Spelstatistik** med detaljerad tracking
- **Nivåprogression** med ökande svårighetsgrad

### Användargränssnitt
- **Responsiv design** som fungerar på alla enheter
- **Tangentbordskontroller** för alla funktioner
- **Förbättrade animationer** och visuella effekter
- **Tema-stöd** med dark/light mode
- **Particle effects** för förbättrad visuell feedback

### Teknisk Integration
- **Backend-anslutning** med robust felhantering
- **Real-time uppdateringar** av highscores
- **Offline-stöd** med lokal lagring
- **API-integration** för framtida utbyggnad

## Teknisk Stack

### Frontend Arkitektur
| Teknologi | Version | Syfte och Fördelar |
|-----------|---------|-------------------|
| **React** | 18.x | Modern UI-framework som ger komponentbaserad arkitektur och effektiv rendering med Virtual DOM |
| **TypeScript** | 5.x | Statisk typning som förhindrar runtime-fel och förbättrar utvecklingsupplevelsen |
| **Vite** | 5.x | Snabb build tool med hot module replacement för snabb utveckling |
| **Tailwind CSS** | 3.x | Utility-first CSS-framework som ger snabb styling och konsekvent design |
| **HTML5 Canvas** | - | Högprestanda rendering för spelgrafik med 60fps spelloop |
| **Vitest** | 1.x | Modern testing framework optimerad för Vite med snabb testkörning |

### Backend Arkitektur
| Teknologi | Version | Syfte och Fördelar |
|-----------|---------|-------------------|
| **Node.js** | 16+ | JavaScript runtime som möjliggör server-side rendering och API-hantering |
| **Express.js** | 4.x | Minimalistisk web framework för att skapa robusta REST API:er |
| **SQLite** | 3.x | Lättviktig databas som lagrar highscores och spelstatistik lokalt |
| **Helmet** | 7.x | Säkerhetsmiddleware som skyddar mot vanliga web-säkerhetsproblem |
| **CORS** | 2.x | Cross-Origin Resource Sharing för säker kommunikation mellan frontend och backend |

## Installation

### Förutsättningar
- **Node.js** version 16 eller högre för att köra både frontend och backend
- **npm** eller **yarn** som pakethanterare för att installera beroenden
- **Git** för att klona projektet från repository

### Steg-för-steg Installation

#### Steg 1: Klona Projektet
```bash
# Klona projektet till din lokala maskin
git clone https://github.com/your-username/Tetris_game.git
cd Tetris_game
```

#### Steg 2: Backend Installation
```bash
# Navigera till backend-mappen och installera beroenden
cd backend
npm install

# Skapa miljövariabler för backend-konfiguration
echo "NODE_ENV=development" > .env
echo "PORT=3001" >> .env
echo "CORS_ORIGIN=http://localhost:5173" >> .env
```

#### Steg 3: Frontend Installation
```bash
# Navigera till frontend-mappen och installera beroenden
cd ../frontend
npm install

# Skapa miljövariabler för frontend-konfiguration
echo "VITE_API_BASE=http://localhost:3001" > .env
```

## Körning

### Utvecklingsläge

#### Starta Backend Server
```bash
# Öppna en terminal och navigera till backend-mappen
cd backend

# Starta backend-servern i utvecklingsläge
npm start

# Servern kommer att starta på http://localhost:3001
# Du kommer att se meddelanden om att servern är igång och databasen är ansluten
```

#### Starta Frontend Development Server
```bash
# Öppna en ny terminal och navigera till frontend-mappen
cd frontend

# Starta frontend development server
npm run dev

# Frontend kommer att starta på http://localhost:5173
# Vite kommer att automatiskt ladda om sidan när du gör ändringar i koden
```

### Produktionsläge

#### Bygga Frontend för Produktion
```bash
# Navigera till frontend-mappen
cd frontend

# Bygg optimerad version för produktion
npm run build

# Detta skapar en optimerad build i dist-mappen
# som kan serveras av vilken webbserver som helst
```

#### Starta Backend i Produktion
```bash
# Navigera till backend-mappen
cd backend

# Starta backend-servern i produktionsläge
npm start

# Alternativt, använd PM2 för process management
npm install -g pm2
pm2 start server.js --name tetris-backend
pm2 save
pm2 startup
```

### Utvecklingsverktyg

#### Frontend Utveckling
```bash
# Navigera till frontend-mappen
cd frontend

# Kör ESLint för kodkvalitet och stil
npm run lint

# TypeScript type checking för att hitta typfel
npm run type-check

# Kör tester med Vitest
npm run test

# Kör tester i watch mode för automatisk testning
npm run test:watch
```

#### Backend Utveckling
```bash
# Navigera till backend-mappen
cd backend

# Starta backend med nodemon för automatisk omstart vid ändringar
npm run dev

# Kör backend-tester
npm test

# Kör tester med kodtäckning
npm run test:coverage
```

## Spelkontroller

### Grundläggande Kontroller
| Tangent | Funktion |
|---------|----------|
| **← →** | Flytta pjäs vänster/höger |
| **↓** | Snabb fall (Soft Drop) |
| **↑** | Rotera pjäs |
| **Space** | Hård fall (Hard Drop) |

### Spelfunktioner
| Tangent | Funktion |
|---------|----------|
| **C** | Håll pjäs (Hold) |
| **P** | Pausa/Fortsätt |
| **Esc** | Pausa (alternativ) |
| **R** | Starta om |

### Meny & Inställningar
| Tangent | Funktion |
|---------|----------|
| **H** | Visa hjälp |
| **S** | Öppna inställningar |
| **M** | Återgå till huvudmeny |

## Poängsystem

### Poängberäkning
| Rader | Poängformel | Exempel (Nivå 1) |
|-------|-------------|------------------|
| **1 rad** | 40 × nivå | 40 poäng |
| **2 rader** | 100 × nivå | 100 poäng |
| **3 rader** | 300 × nivå | 300 poäng |
| **4 rader** | 1200 × nivå | 1200 poäng |

### Nivåsystem
- **Ny nivå** var 10:e rad
- **Hastighet** ökar med varje nivå
- **Svårighetsgrad** skalar exponentiellt
- **Maximal nivå** är 20 (extremt snabbt)

### Bonuspoäng
- **Soft Drop**: 1 poäng per cell
- **Hard Drop**: 2 poäng per cell
- **Combo-bonus**: Extra poäng för flera rader i rad
- **T-spin**: Specialpoäng för T-spin moves

## Utveckling

### Backend API Arkitektur

Backend-servern är byggd med Express.js och tillhandahåller RESTful API:er för att hantera speldata och highscores. Servern använder SQLite som databas för enkel deployment och underhåll.

#### Hälsa och Status Endpoint
```http
GET /api/health
```
**Syfte:** Kontrollerar att servern är igång och databasen är ansluten
**Response:** JSON med serverstatus, version, uptime och databasanslutning
**Användning:** Används av frontend för att verifiera backend-tillgänglighet

#### Highscore Management Endpoints
```http
GET /api/scores?limit=10&page=1
POST /api/scores
DELETE /api/scores/:id
```
**Syfte:** Hanterar highscore-listan med fullständig CRUD-funktionalitet
**GET:** Hämtar paginerad lista av highscores med sortering på poäng
**POST:** Sparar ny highscore med validering av speldata
**DELETE:** Tar bort specifik highscore (admin-funktion)

#### Statistik Endpoint
```http
GET /api/stats
```
**Syfte:** Returnerar aggregerad spelstatistik för analys
**Data:** Totalt antal spel, genomsnittlig poäng, högsta poäng, etc.

### Miljövariabler och Konfiguration

Backend-servern använder miljövariabler för konfiguration. Skapa en `.env`-fil i backend-mappen med följande inställningar:

```env
# Server-konfiguration
PORT=3001                    # Port som servern ska lyssna på
NODE_ENV=development         # Miljö (development/production)

# Databas-konfiguration
DB_PATH=./tetris.db         # Sökväg till SQLite-databasen

# Säkerhet och CORS
CORS_ORIGIN=http://localhost:5173  # Tillåten origin för frontend
```

**Viktiga kommentarer:**
- `NODE_ENV=development` aktiverar utvecklingsläge med mindre strikt validering
- `CORS_ORIGIN` måste matcha frontend-URL:en för att API-anrop ska fungera
- `DB_PATH` pekar på SQLite-filen som skapas automatiskt vid första körning

### Bygga för Produktion

#### Frontend Build Process
```bash
# Navigera till frontend-mappen
cd frontend

# Bygg optimerad version för produktion
npm run build

# Detta skapar en optimerad build i dist-mappen med:
# - Minifierad JavaScript och CSS
# - Optimerade assets och bilder
# - Tree shaking för att ta bort oanvänd kod
# - Source maps för debugging
```

#### Backend Deployment
```bash
# Navigera till backend-mappen
cd backend

# Starta backend-servern i produktionsläge
npm start

# Alternativt, använd PM2 för process management
npm install -g pm2
pm2 start server.js --name tetris-backend
pm2 save
pm2 startup
```

**Produktionskonfiguration:**
- Sätt `NODE_ENV=production` för striktare säkerhet
- Konfigurera `CORS_ORIGIN` till din produktions-URL
- Använd HTTPS i produktion för säker kommunikation

## Felsökning

### Vanliga Problem och Lösningar

#### Backend Server Startar Inte
```bash
# Kontrollera om port 3001 redan används av annan process
netstat -an | findstr :3001

# Verifiera att Node.js är korrekt installerat
node --version

# Kontrollera att alla beroenden är installerade
cd backend
npm list

# Kontrollera att .env-filen finns och är korrekt konfigurerad
cat .env
```

#### Frontend Kan Inte Ansluta till Backend
```bash
# Testa backend-anslutning med curl
curl http://localhost:3001/api/health

# Verifiera CORS-inställningar i backend .env-fil
# Kontrollera att CORS_ORIGIN matchar frontend-URL

# Testa nätverksanslutning mellan frontend och backend
ping localhost
```

#### Databasproblem och SQLite
```bash
# Kontrollera SQLite-installation
sqlite3 --version

# Verifiera skrivbehörigheter för databasfilen
ls -la backend/tetris.db

# Återställ databas vid korruptionsproblem (varning: tar bort all data)
rm backend/tetris.db
# Databasen skapas automatiskt vid nästa serverstart
```

#### Score Validation Errors
```bash
# Om du får "Score validation failed" fel:

# 1. Kontrollera att backend körs i development mode
echo $NODE_ENV  # Ska vara 'development' eller undefined

# 2. Verifiera backend-loggar för detaljerade felmeddelanden
# Backend loggar alla valideringsfel med specifik information

# 3. I development mode ska alla scores accepteras automatiskt
# Sätt NODE_ENV=development i backend .env-filen

# 4. Kontrollera att alla required fields skickas med
# name, points, level, lines är obligatoriska
```

### Linting & Kodkvalitet

```bash
# Fixa automatiska linting-fel
cd frontend
npm run lint -- --fix

# Type checking
npm run type-check

# Kör tester
npm run test
```

### Score Validation Troubleshooting

Om du får "Score validation failed" fel när du försöker spara en score:

1. **Kontrollera Backend Mode**:
   ```bash
   # Backend ska köra i development mode
   echo $NODE_ENV  # Ska vara 'development' eller undefined
   ```

2. **Starta om Backend**:
   ```bash
   cd backend
   # Stoppa servern (Ctrl+C)
   npm start  # Starta om
   ```

3. **Verifiera API Connection**:
   ```bash
   # Testa backend-anslutning
   Invoke-WebRequest -Uri "http://localhost:3001/api/health"
   ```

4. **Kontrollera Backend Logs**:
   - Sök efter "Development mode: Score validation bypassed"
   - Verifiera att NODE_ENV inte är 'production'

## Projektstruktur

Projektet är organiserat i en monorepo-struktur med separata frontend- och backend-mappar för tydlig separation av ansvar och enkel utveckling.

### Backend Struktur
```
backend/
├── server.js                  # Huvudserver-fil med Express.js och säkerhetskonfiguration
├── package.json               # Backend-beroenden och scripts
├── tetris.db                  # SQLite-databas för persistent lagring av highscores
├── .env                       # Miljövariabler för konfiguration
├── node_modules/              # Installerade npm-paket
├── __tests__/                 # Testfiler för backend-funktionalitet
├── routes/                    # API route-hanterare
├── models/                    # Databasmodeller och scheman
├── utils/                     # Hjälpfunktioner och utilities
└── config/                    # Konfigurationsfiler
```

### Frontend Struktur
```
frontend/
├── src/
│   ├── components/            # Modulära React-komponenter
│   │   ├── GameBoard.tsx      # Huvudspelplan med Canvas-rendering
│   │   ├── SidePanel.tsx      # Sidopanel med poäng och nästa pjäser
│   │   ├── MainMenu.tsx       # Huvudmeny med navigering
│   │   ├── Settings.tsx       # Inställningar för ljud och tema
│   │   ├── Help.tsx           # Hjälpsida med spelinstruktioner
│   │   ├── AnimatedBackground.tsx  # Animerad bakgrund
│   │   ├── ParticleEffect.tsx # Partikeleffekter för visuell feedback
│   │   └── ThemeContext.tsx   # Tema-hantering med React Context
│   ├── hooks/                 # Custom React hooks för återanvändbar logik
│   │   └── useSound.ts        # Ljudhantering med Web Audio API
│   ├── contexts/              # React Context för global state
│   ├── App.tsx                # Huvudapplikationskomponent
│   ├── tetris.ts              # Kärnspellogik och game loop
│   ├── api.ts                 # API-integration med backend
│   ├── MiniPreview.tsx        # Miniatyrvisning av nästa pjäser
│   └── index.css              # Globala stilar och Tailwind CSS
├── public/                    # Statiska filer och assets
│   └── audio/                 # Ljudfiler för spelet
├── package.json               # Frontend-beroenden och scripts
├── .eslintrc.cjs              # ESLint-konfiguration för kodkvalitet
├── tailwind.config.js         # Tailwind CSS-konfiguration
├── vite.config.ts             # Vite build tool-konfiguration
├── tsconfig.json              # TypeScript-konfiguration
└── index.html                 # HTML-mall för applikationen
```

### Dokumentation
```
├── README.md                  # Huvuddokumentation för projektet
├── STATE_MANAGEMENT.md        # Detaljerad dokumentation av state-hantering
├── AUDIO_FEATURES.md          # Dokumentation av ljudfunktioner
├── IMPLEMENTATION_GUIDE.md    # Implementeringsguide för utvecklare
└── COMPONENTS_README.md       # Dokumentation av React-komponenter
```

## Säkerhet

### Implementerade Säkerhetsåtgärder

- **Helmet** för säkerhetsheaders
- **Input-validering** på alla endpoints
- **CORS-konfiguration** för säker kommunikation
- **SQL-injection-skydd** med parameteriserade queries
- **Rate limiting** (förberedd för implementation)
- **XSS-skydd** med proper encoding

### Säkerhetsheaders

```javascript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

## Prestanda

### Frontend Optimeringar

- **HTML5 Canvas rendering** för högprestanda spelplan
- **requestAnimationFrame** för smidig 60fps spelloop
- **React.memo** och **useCallback** för optimerad rendering
- **Efficient state-hantering** med useReducer
- **Lazy loading** av komponenter
- **Code splitting** med Vite

### Backend Optimeringar

- **Komprimering** med gzip
- **Database-indexering** för snabba queries
- **Connection pooling** för databasanslutningar
- **Caching** av statiska resurser
- **Graceful shutdown** för säker avslutning

### Prestandamätning

```bash
# Frontend bundle-analys
cd frontend
npm run build
npm run preview

# Backend prestanda
cd backend
npm run test:perf
```

## Projektplanering med Trello

Vi använder [Trello](https://trello.com/) för att hantera vår produktbacklog och projektplanering.

### Trello Board-struktur

| Lista | Syfte | Exempel |
|-------|-------|---------|
| **Backlog** | Kommande funktioner | Multiplayer, AI-motståndare |
| **To Do** | Redo att arbetas med | Bug fixes, UI-förbättringar |
| **In Progress** | Aktuellt arbete | Nya features under utveckling |
| **Review** | Kod som väntar på granskning | Pull requests |
| **Done** | Avslutade uppgifter | Implementerade features |

### Automatisering med Butler

- **Automatisk flytt** av kort baserat på etiketter
- **Påminnelser** för deadlines
- **Automatisk tilldelning** av uppgifter
- **Statistik och rapporter** för projektframsteg

## Bidrag

Vi välkomnar bidrag från alla! Här är hur du kan bidra:

### Snabbstart för bidrag

1. **Forka projektet**
   ```bash
   git clone https://github.com/your-username/Tetris_game.git
   cd Tetris_game
   ```

2. **Skapa en feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Gör dina ändringar**
   ```bash
   # Utveckla din feature
   npm run dev
   ```

4. **Testa dina ändringar**
   ```bash
   npm run test
   npm run lint
   ```

5. **Committa och pusha**
   ```bash
   git commit -m 'Add some AmazingFeature'
   git push origin feature/AmazingFeature
   ```

6. **Öppna en Pull Request**

### Kodstandard

- **ESLint** för kodkvalitet
- **TypeScript** best practices
- **Tester** för nya funktioner
- **Dokumentation** av API-ändringar
- **Trello-kort** uppdatering med framsteg

### Bidragsområden

- **Bug fixes** och förbättringar
- **Nya features** och funktioner
- **UI/UX förbättringar**
- **Prestanda optimering**
- **Dokumentation**
- **Tester**

## Licens

Detta projekt är öppen källkod och tillgängligt under [MIT-licensen](LICENSE).

```
MIT License

Copyright (c) 2024 Tetris Game Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Tack

Tack för att du spelar vårt Tetris-spel! Hoppas du tycker om de nya förbättringarna i version 2.0.0!

### Särskilt tack till

- **React-teamet** för det fantastiska frameworket
- **TypeScript-teamet** för typning och utveckling
- **Vite-teamet** för den snabba build-toolen
- **Tailwind CSS-teamet** för det flexibla CSS-frameworket
- **Alla bidragsgivare** som hjälpt till med projektet

## Aktuell Utvecklingsstatus

### Senaste Fixes (Augusti 2024)
- ✅ **React Key Props**: Fixade varningar om saknade key props i listor
- ✅ **Score Validation**: Development mode bypass för score validation
- ✅ **API Error Handling**: Förbättrad felhantering för score submission

### Kända Problem & Lösningar
- **Score Validation Errors**: I development mode ska alla scores accepteras automatiskt
- **Backend Restart**: Vid ändringar i backend-koden krävs omstart av servern
- **Port Conflicts**: Kontrollera att port 3001 är tillgänglig för backend

### Nästa Steg
 
- Förbättra anti-cheat system
- Lägga till multiplayer-funktionalitet

## Kommande Funktioner

Se vår [Trello Backlog](https://trello.com/) för detaljerad planering av kommande funktioner:

### Spelfunktioner
- **Multiplayer-läge** - Spela mot andra online
- **AI-motståndare** - Spela mot datorn
- **Tema-system** - Anpassningsbara visuella teman
- **Achievement-system** - Lås upp prestationer
- **Ljud och musik** - Förbättrad ljudupplevelse

### Plattformar
- **Mobilanpassning** - Touch-kontroller för mobiler
- **Offline-läge** - Spela utan internetanslutning
- **Progressive Web App (PWA)** - App-liknande upplevelse
- **Desktop-app** - Native app för Windows/Mac/Linux

### Sociala Funktioner
- **Sociala medier** - Dela highscores
- **Vänlistor** - Spela med vänner
- **Turneringar** - Organiserade tävlingar
- **Leaderboards** - Globala topplistor

### Tekniska Förbättringar
- **WebSocket-integration** för realtidsmultiplayer
- **Service Worker** för offline-funktionalitet
- **CI/CD-pipeline** med automatisk testing
- **Microservices-arkitektur** för skalbarhet

## Changelog

### v2.0.1 (2024-08-20)
#### Bug fixes
- Fixade React key prop varningar i App.tsx
- Förbättrade score validation i development mode
- Development mode bypass för score validation
- Bättre felhantering för API-anrop

#### Tekniska förbättringar
- Score validation logik optimerad för utveckling
- Debug logging för score validation
- Mer lenient validation i development mode

### v2.0.0 (2024-01-XX)
#### Nya funktioner
- Förbättrad prestanda och säkerhet
- Modulär komponentarkitektur
- Nya API-endpoints för statistik
- Förbättrad felhantering
- Moderniserad UI med animationer

#### Tekniska förbättringar
- ESLint-konfiguration
- Graceful shutdown
- Bättre TypeScript-stöd
- Comprehensive testing med Vitest
- Glassmorphism-effekter

#### Bug fixes
- Fixade memory leaks i spelloopen
- Förbättrad responsivitet
- Korrigerade poängberäkning
- Fixade CORS-problem

### v1.0.0 (2023-XX-XX)
- Grundläggande Tetris-funktionalitet
- Highscore-system
- Backend-anslutning
- Responsiv design

---

**Spela nu på [http://localhost:5173](http://localhost:5173)**

*Lycka till med att nå nya highscores!* 