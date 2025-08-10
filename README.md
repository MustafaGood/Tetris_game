# 🎮 Fullstack Tetris Game v2.0.0

Ett komplett och moderniserat Tetris-spel byggt med React, TypeScript, Node.js och SQLite. Spelet innehåller alla klassiska Tetris-funktioner plus en highscore-lista med förbättrad prestanda och säkerhet.

## 🚀 Nya Funktioner i v2.0.0

- **Förbättrad prestanda** med optimerad rendering och state-hantering
- **Modulär arkitektur** med separata komponenter för bättre underhållbarhet
- **Förbättrad säkerhet** med Helmet, CORS-konfiguration och input-validering
- **Bättre felhantering** med detaljerade felmeddelanden och återhämtning
- **Moderniserad UI** med förbättrade animationer och responsiv design
- **Statistik-endpoint** för att spåra spelstatistik
- **Graceful shutdown** för säker serveravslutning
- **ESLint-konfiguration** för bättre kodkvalitet
- **Förbättrad TypeScript** med striktare typer och bättre felhantering

## 🎯 Funktioner

- **Klassisk Tetris-spel** med alla 7 tetromino-former
- **Hold-funktion** för att spara pjäser
- **Poängsystem** med nivåer och rader
- **Highscore-lista** med persistent lagring
- **Responsiv design** med modern UI
- **Tangentbordskontroller** för alla funktioner
- **Backend-anslutning** med felhantering
- **7-bag system** för balanserad pjäsfördelning
- **Förbättrade animationer** och visuella effekter

## 🛠️ Teknisk Stack

### Frontend
- **React 18** med TypeScript
- **Vite** för snabb utveckling
- **Tailwind CSS** för styling
- **Custom animations** och glassmorphism-effekter
- **ESLint** för kodkvalitet
- **Modulär komponentarkitektur**

### Backend
- **Node.js** med Express
- **SQLite** för databas
- **Helmet** för säkerhetsheaders
- **Compression** för prestanda
- **Morgan** för logging
- **CORS** för säker kommunikation
- **Error handling** och graceful shutdown

## 📦 Installation

### Förutsättningar
- Node.js (version 16 eller högre)
- npm eller yarn

### Steg 1: Klona projektet
```bash
git clone <repository-url>
cd tetris-game
```

### Steg 2: Installera backend-beroenden
```bash
cd backend
npm install
```

### Steg 3: Installera frontend-beroenden
```bash
cd ../frontend
npm install
```

## 🎯 Körning

### Snabbstart (Manuell)
Du behöver starta både backend och frontend manuellt i separata terminaler:

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```
Servern kommer att starta på `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend kommer att starta på `http://localhost:5173`

### Alternativ: Kör båda samtidigt
Om du vill köra båda servrarna samtidigt, öppna två terminaler och kör kommandona ovan parallellt.

### Utvecklingsläge
```bash
# Backend med auto-reload
cd backend
npm run dev

# Frontend med linting
cd frontend
npm run lint
npm run type-check
```

## 🎮 Spelkontroller

### Rörelse & Kontroll
- **← →** - Flytta pjäs vänster/höger
- **↓** - Snabb fall (Soft Drop)
- **↑** - Rotera pjäs
- **Space** - Hård fall (Hard Drop)

### Funktioner
- **C** - Håll pjäs (Hold)
- **P** - Pausa/Fortsätt
- **Esc** - Pausa (alternativ)
- **R** - Starta om

## 🏆 Poängsystem

- **1 rad**: 40 × nivå
- **2 rader**: 100 × nivå
- **3 rader**: 300 × nivå
- **4 rader**: 1200 × nivå

Ny nivå var 10:e rad - spelet går snabbare på högre nivåer.

## 🔧 Utveckling

### Backend API Endpoints

- `GET /api/health` - Hälsokontroll med version och uptime
- `GET /api/scores?limit=10` - Hämta highscores
- `POST /api/scores` - Spara ny poäng
- `DELETE /api/scores/:id` - Ta bort poäng
- `GET /api/stats` - Hämta spelstatistik

### Miljövariabler

Skapa en `.env`-fil i backend-mappen:
```env
PORT=3001
NODE_ENV=development
```

### Bygga för produktion

```bash
# Frontend
cd frontend
npm run build

# Backend (ingen build nödvändig)
cd ../backend
npm start
```

## 🐛 Felsökning

### Backend startar inte
- Kontrollera att port 3001 är ledig
- Verifiera att alla beroenden är installerade
- Kontrollera Node.js-versionen (>=16)

### Frontend kan inte ansluta till backend
- Kontrollera att backend-servern körs
- Verifiera CORS-inställningar
- Kontrollera nätverksanslutning

### Databasproblem
- Kontrollera att SQLite är installerat
- Verifiera skrivbehörigheter i backend-mappen
- Kontrollera databasfilen `tetris.db`

### Linting-fel
```bash
cd frontend
npm run lint -- --fix
```

## 📁 Projektstruktur

```
tetris-game/
├── backend/
│   ├── server.js          # Express-server med säkerhet
│   ├── package.json       # Backend-beroenden
│   └── tetris.db         # SQLite-databas
├── frontend/
│   ├── src/
│   │   ├── components/    # Modulära komponenter
│   │   │   ├── GameBoard.tsx
│   │   │   ├── SidePanel.tsx
│   │   │   └── MainMenu.tsx
│   │   ├── App.tsx        # Huvudkomponent
│   │   ├── tetris.ts      # Spellogik
│   │   ├── api.ts         # API-anrop
│   │   └── MiniPreview.tsx # Miniatyrvisning
│   ├── package.json       # Frontend-beroenden
│   ├── .eslintrc.cjs      # ESLint-konfiguration
│   └── index.html         # HTML-mall
└── README.md              # Denna fil
```

## 🔒 Säkerhet

- **Helmet** för säkerhetsheaders
- **Input-validering** på alla endpoints
- **CORS-konfiguration** för säker kommunikation
- **SQL-injection-skydd** med parameteriserade queries
- **Rate limiting** (kan läggas till vid behov)

## 📊 Prestanda

- **Komprimering** med gzip
- **Optimerad rendering** med React.memo och useCallback
- **Efficient state-hantering** med useReducer där lämpligt
- **Lazy loading** av komponenter (kan implementeras)
- **Database-indexering** för snabba queries

## 🤝 Bidrag

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Committa dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Pusha till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

### Kodstandard
- Använd ESLint för kodkvalitet
- Följ TypeScript best practices
- Skriv tester för nya funktioner
- Dokumentera API-ändringar

## 📄 Licens

Detta projekt är öppen källkod och tillgängligt under MIT-licensen.

## 🙏 Tack

Tack för att du spelar vårt Tetris-spel! Hoppas du tycker om de nya förbättringarna i version 2.0.0! 🎮✨

## 📝 Changelog

### v2.0.0
- Förbättrad prestanda och säkerhet
- Modulär komponentarkitektur
- Nya API-endpoints för statistik
- Förbättrad felhantering
- Moderniserad UI med animationer
- ESLint-konfiguration
- Graceful shutdown
- Bättre TypeScript-stöd

### v1.0.0
- Grundläggande Tetris-funktionalitet
- Highscore-system
- Backend-anslutning
- Responsiv design 