# Tetris Spel v2.0.0

Ett komplett och moderniserat Tetris-spel byggt med React, TypeScript, Node.js och SQLite. Spelet innehåller alla klassiska Tetris-funktioner plus en highscore-lista med förbättrad prestanda och säkerhet.

[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Innehållsförteckning

- [Funktioner](#funktioner)
- [Teknisk Stack](#teknisk-stack)
- [Installation](#installation)
- [Körning](#körning)
- [Spelkontroller](#spelkontroller)
- [Poängsystem](#poängsystem)
- [Utveckling](#utveckling)
- [Felsökning](#felsökning)
- [Projektstruktur](#projektstruktur)
- [Bidrag](#bidrag)
- [Licens](#licens)

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
- **Offline-stöd** med lokal lagring och service worker
- **API-integration** för framtida utbyggnad
- **PWA-funktionalitet** med manifest och service worker

## Teknisk Stack

### Frontend
- **React 18** - Modern UI-framework
- **TypeScript 5** - Statisk typning
- **Vite 5** - Snabb build tool
- **Tailwind CSS 3** - Utility-first CSS
- **HTML5 Canvas** - Högprestanda rendering
- **Vitest** - Testing framework

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js 4** - Web framework
- **SQLite 3** - Lättviktig databas
- **Helmet** - Säkerhetsmiddleware
- **CORS** - Cross-origin resource sharing

## Installation

### Förutsättningar
- **Node.js** version 18 eller högre
- **npm** eller **yarn** som pakethanterare
- **Git** för att klona projektet

### Steg-för-steg Installation

#### Steg 1: Klona Projektet
```bash
git clone https://github.com/your-username/Tetris_game.git
cd Tetris_game
```

#### Steg 2: Installera Alla Beroenden
```bash
npm run install:all
```

#### Steg 3: Konfigurera Miljövariabler
```bash
# Backend
cd backend
echo "NODE_ENV=development" > .env
echo "PORT=3001" >> .env
echo "CORS_ORIGIN=http://localhost:5173" >> .env

# Frontend
cd ../frontend
echo "VITE_API_BASE=http://localhost:3001" > .env
```

## Körning

### Utvecklingsläge

#### Starta Både Frontend och Backend
```bash
# Starta båda servrarna samtidigt
npm run dev
```

#### Starta Separata Servrar
```bash
# Backend
npm run dev:backend

# Frontend (i ny terminal)
npm run dev:frontend
```

### Produktionsläge

#### Bygga Frontend
```bash
npm run build
```

#### Starta Backend
```bash
npm start
```

### Utvecklingsverktyg

#### Frontend
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run test          # Vitest
```

#### Backend
```bash
cd backend
npm run lint          # ESLint
npm test              # Jest
npm run test:coverage # Med kodtäckning
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
- **Maximal nivå** är 20

### Bonuspoäng
- **Soft Drop**: 1 poäng per cell
- **Hard Drop**: 2 poäng per cell
- **Combo-bonus**: Extra poäng för flera rader i rad
- **T-spin**: Specialpoäng för T-spin moves

## Utveckling

### Backend API

#### Endpoints
- `GET /api/health` - Serverhälsa
- `GET /api/scores` - Hämta highscores
- `POST /api/scores` - Spara ny highscore
- `DELETE /api/scores/:id` - Ta bort highscore
- `GET /api/stats` - Spelstatistik

#### Exempel på API-anrop
```bash
# Testa backend-anslutning
curl http://localhost:3001/api/health

# Hämta highscores
curl http://localhost:3001/api/scores

# Spara ny score
curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"name":"Spelare1","points":15000,"level":15,"lines":120}'
```

### Miljövariabler

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_BASE=http://localhost:3001
VITE_APP_NAME=Tetris Game
VITE_APP_VERSION=2.0.0
```

## Felsökning

### Vanliga Problem

#### Backend Startar Inte
```bash
# Kontrollera port
netstat -an | findstr :3001

# Verifiera Node.js
node --version

# Kontrollera beroenden
cd backend && npm list
```

#### Frontend Kan Inte Ansluta
```bash
# Testa backend
curl http://localhost:3001/api/health

# Verifiera CORS-inställningar
# Kontrollera .env-filer
```

#### Databasproblem
```bash
# Återställ databas (varning: tar bort all data)
rm backend/tetris.db
# Databasen skapas automatiskt vid nästa start
```

### Score Validation Errors
- Sätt `NODE_ENV=development` i backend .env
- Starta om backend-servern
- Kontrollera att alla required fields skickas med

## Projektstruktur

```
Tetris_game/
├── frontend/                 # React-applikation
│   ├── src/
│   │   ├── components/       # React-komponenter
│   │   ├── hooks/           # Custom hooks
│   │   ├── contexts/        # React contexts
│   │   ├── App.tsx          # Huvudapplikation
│   │   └── tetris.ts        # Spellogik
│   ├── public/              # Statiska filer
│   └── package.json
├── backend/                  # Node.js-server
│   ├── server.js            # Huvudserver
│   ├── routes/              # API-routes
│   ├── models/              # Databasmodeller
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## Bidrag

Vi välkomnar bidrag från alla!

### Snabbstart
1. **Forka projektet**
2. **Skapa feature branch**
3. **Gör dina ändringar**
4. **Testa dina ändringar**
5. **Öppna Pull Request**

### Kodstandard
- **ESLint** för kodkvalitet
- **TypeScript** best practices
- **Tester** för nya funktioner
- **Dokumentation** av API-ändringar

## Licens

Detta projekt är öppen källkod och tillgängligt under [MIT-licensen](LICENSE).

---

**Spela nu på [http://localhost:5173](http://localhost:5173)**

*Lycka till med att nå nya highscores!* 