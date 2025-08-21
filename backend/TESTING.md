# 🧪 Testing Guide - Tetris Backend API

## 📋 Overview

This guide covers comprehensive testing of the Tetris backend API, including both valid and invalid data scenarios, anti-cheat validation, and error handling.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (for integration tests)
- Jest testing framework

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
```

## 🧪 Test Categories

### 1. API Integration Tests (`api.test.js`)
Tests the complete API endpoints with real HTTP requests.

```bash
npm run test:api
```

**What it tests:**
- ✅ **Health Endpoint** - Server status and database connection
- ✅ **Game Seed Generation** - Anti-cheat seed creation and validation
- ✅ **Score Validation** - Pre-submission validation with various scenarios
- ✅ **Score Submission** - Complete score submission flow
- ✅ **Score Retrieval** - Top scores and pagination
- ✅ **Score Deletion** - Admin score removal
- ✅ **Admin Analysis** - Anti-cheat pattern detection
- ✅ **Rate Limiting** - Protection against spam
- ✅ **Error Handling** - Malformed requests and edge cases

### 2. Score Calculator Unit Tests (`scoreCalculator.test.js`)
Tests the core anti-cheat logic functions.

```bash
npm run test:calculator
```

**What it tests:**
- ✅ **Game Seed Generation** - Valid format and uniqueness
- ✅ **Seed Validation** - Format checking and edge cases
- ✅ **Score Calculation** - Expected score computation
- ✅ **Score Validation** - Anti-cheat rule enforcement
- ✅ **Pattern Analysis** - Suspicious behavior detection
- ✅ **Hash Generation** - Score integrity verification

### 3. Frontend API Tests (`frontend/src/__tests__/api.test.ts`)
Tests the frontend API integration layer.

```bash
cd frontend
npm test api.test.ts
```

**What it tests:**
- ✅ **API Calls** - All frontend API functions
- ✅ **Data Normalization** - MongoDB/SQLite compatibility
- ✅ **Error Handling** - Network errors and validation failures
- ✅ **Utility Functions** - Date formatting, score formatting
- ✅ **Game Seed Management** - Expiry checking and time calculations

## 📊 Test Scenarios

### Valid Data Tests
```javascript
{
  name: 'TestPlayer',
  points: 1000,
  level: 5,
  lines: 20,
  gameSeed: 'a1b2c3d4e5f67890',
  gameDuration: 120000
}
```

### Invalid Data Tests
```javascript
- Empty or null names
- Negative points
- Invalid levels (0, >20)
- Negative lines
- Impossible score combinations
- Invalid game seeds
- Malformed JSON
- Missing required fields
```

### Anti-Cheat Tests
```javascript
- Impossible score jumps (>50,000 points)
- Too many scores in 24 hours (>10)
- Very high scores with low levels
- Invalid level/line combinations
- Expired game seeds
```

### Error Handling Tests
```javascript
- Network failures
- Database connection issues
- Rate limiting (429 responses)
- Malformed requests
- Non-existent endpoints
- Invalid ID formats
```

## 🔧 Test Configuration

### Environment Variables
```bash
# Test environment
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/tetris-test
```

### Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
```

## 📈 Test Coverage

### Backend Coverage

# Testing Guide - Tetris Backend och Frontend

<!--
  Kommentar: Denna fil beskriver teststrategin för både backend och frontend för Tetris-projektet.
  Målet är att ge tydliga instruktioner för att köra och utvärdera tester, beskriva testkategorier
  och ge exempel på vanliga testscenarier. Emojis har tagits bort och texten är formulerad på svenska.
-->

## Översikt

Denna guide beskriver hur tester är organiserade för Tetris-projektet. Den täcker:

- Backend: integrationstester mot API:t, anti-fusk-logik och enhetsprov för score-beräkning.
- Frontend: tester för API-anrop från klienten, normalisering av data och UI-relaterade enhetstester.

Filen innehåller exempel på testscenarier, konfigurationer för Jest och tips för felsökning.

<!-- Kommentar: Följande avsnitt är snabba instruktioner för att komma igång. -->

## Snabbstart

### Förutsättningar

- Node.js 18 eller senare
- MongoDB (lokalt eller i testmiljö) för integrationstester
- Jest som testrunner

### Installera beroenden

```bash
cd backend
npm install
```

### Kör alla tester

```bash
npm test
```

## Testkategorier

### 1) API-integrationstester (`api.test.js`)

Beskriver end-to-end-test av serverändpunkter med verkliga HTTP-anrop. Används för att verifiera att
servern, databaslagret och valideringslogiken fungerar tillsammans.

Använd:
```bash
npm run test:api
```

Vad som kontrolleras i korthet:
- Hälsokontroll och databasanslutning
- Generering och validering av spel-seed (anti-fusk)
- Förvalidering och inskickning av poäng
- Retrieving av topplistor och paginering
- Administratörsåtgärder (ta bort poäng, analys)
- Rate limiting och felhantering

### 2) Enhetstester för score-beräknaren (`scoreCalculator.test.js`)

Fokuserar på anti-fusk-logik och poängberäkningar. Dessa tester ska vara snabba och deterministiska.

Använd:
```bash
npm run test:calculator
```

Checklistan för dessa tester inkluderar:
- Format och unika egenskaper för spel-seed
- Valideringsregler och kantfall
- Poäng- och hashberäkningar
- Analys av misstänkt beteende

### 3) Frontend-tester (`frontend/src/__tests__/api.test.ts`)

Tester som validerar frontendens API-lager: att anrop görs korrekt, att svar normaliseras och att fel
hanteras på klientsidan. Dessa körs från frontend-mappen.

Använd:
```bash
cd frontend
npm test api.test.ts
```

Vad frontend-testerna täcker:
- Korrekt anrop till backend-API:er
- Normalisering av data (till exempel MongoDB ↔ SQLite-format)
- Hantering av nätverksfel och valideringsfel
- Hjälpfunktioner som datum- och poängformattering
- Hantering av spel-seed och dess giltighetstid

## Testscenarier (exempel)

Giltiga dataexempel:
```javascript
{
  name: 'TestPlayer',
  points: 1000,
  level: 5,
  lines: 20,
  gameSeed: 'a1b2c3d4e5f67890',
  gameDuration: 120000
}
```

Vanliga ogiltiga fall att testa:

- Tomma eller null-värden för namn
- Negativa poäng eller linjer
- Ogiltiga nivåer (t.ex. 0 eller större än tillåtet max)
- Orealistiska poängkombinationer som indikerar fusk
- Ogiltiga eller utgångna spel-seeds
- Felaktig JSON eller saknade fält

Anti-fusk-scenarier att inkludera:

- Orealistiska hopp i poäng (stora ökningssteg över rimlig gräns)
- För många inlämningar från samma användare inom 24 timmar
- Höga poäng på mycket låga nivåer
- Motsägelsefull nivå/lines-kombination
- Utgångna eller manipulerade spel-seeds

Felsökningsscenarier:

- Nätverksavbrott
- Databasproblem (anslutningsfel)
- Rate limiting (429)
- Begäranden mot icke-existerande ändpunkter
- Ogiltiga ID-format

## Testkonfiguration

Miljövariabler för test:
```bash
# Testmiljö
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/tetris-test
```

Jest-konfiguration (exempel):
```javascript
module.exports = {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': { useESM: true }
  },
  moduleNameMapping: { '^(\\.{1,2}/.*)\\.js$': '$1' }
};
```

## Testtäckning (översikt)

Backend: fokuserar på API-ändpunkter, anti-fusk-regler, felhantering, databasoperationer och rate limiting.

Frontend: fokuserar på API-integration, data-normalisering, felhantering i klienten och hjälputrustning.

<!-- Kommentar: Följande avsnitt visar kommandon för att köra specifika testkörningar och felsökningskommandon. -->

## Köra specifika tester

Kör tester med täckningsrapport:
```bash
npm run test:coverage
```

Kör tester i watch-läge:
```bash
npm run test:watch
```

Kör specifik testfil:
```bash
# API-tests
npm run test:api

# Score calculator
npm run test:calculator

# Kör en enskild fil med jest
npx jest api.test.js
```

Kör med verbose-utdata:
```bash
npm test -- --verbose
```

## Felsökning

Debugga misslyckade tester:
```bash
npm test -- --verbose --detectOpenHandles
npx jest --testNamePattern="should reject invalid score"
```

Databasproblem (exempel):
```bash
mongosh mongodb://localhost:27017/tetris-test
mongosh mongodb://localhost:27017/tetris-test --eval "db.dropDatabase()"
```

Vanliga problem och lösningar:

- MongoDB-anslutning: kontrollera att tjänsten körs och att `MONGODB_URI` är korrekt.
- Portkonflikter: starta testservern med `app.listen(0)` för att få en ledig port i tester.
- Testtimeout: öka `testTimeout` i jest-konfigurationen vid behov.

## Kontinuerlig integration (exempel)

Ett enkelt GitHub Actions-jobb som startar en MongoDB-tjänst och kör testerna kan se ut så här:

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports: ['27017:27017']
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with: { node-version: '18' }
      - run: npm install
      - run: npm test
```

## Sammanfattning och nästa steg

Denna fil uppdaterar testdokumentationen för att vara tydligare och mer tillgänglig för utvecklare som arbetar både med backend och frontend. Nästa rekommenderade steg är att säkerställa att testskript i `package.json` är up-to-date och att CI-konfigurationen kör testerna med rätt miljövariabler.

<!-- Kommentar: Om du vill kan jag också uppdatera README eller package.json-skript för att matcha dessa instruktioner. -->
