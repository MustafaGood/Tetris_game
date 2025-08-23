# Ändringslogg

Alla viktiga ändringar i Tetris-spelet kommer att dokumenteras i denna fil.

Formatet baseras på [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
och detta projekt följer [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planerat
- Multiplayer-stöd
- Topplistesystem
- Anpassningsbara teman och utseenden
- Avancerade svårighetsgrader

## [2.0.0] - 2024-12-19

### 🚀 Lagt till
- **PWA-stöd**: Fullständig Progressive Web App-funktionalitet
  - Offline-läge med service worker
  - App-installationsmöjlighet
  - Push-notifikationer
  - Bakgrundssynkronisering
- **Förbättrat ljudsystem**: Flera ljudeffekter och bakgrundsmusik
  - Tetris-temamusik
  - Ljud för radering
  - Ljud för Tetris-rensning
  - Ljudfeedback för rörelse och rotation
- **CI/CD-pipeline**: Automatiserad testning och distribution
  - GitHub Actions-arbetsflöden
  - Automatiserad testning vid pull requests
  - Prestandaövervakning med Lighthouse CI
  - Säkerhetsskanning med Trivy
- **GitHub Pages-distribution**: Automatisk distribution till GitHub Pages
- **Omfattande testning**: Enhetstester, integrationstester och E2E-tester
  - Vitest för enhetstester
  - Playwright för E2E-tester
  - Tillgänglighetstester
  - Prestandatester

### 🔧 Ändrat
- **Projektstruktur**: Modulär arkitektur för bättre underhållbarhet
- **Byggsystem**: Vite-baserat bygge med optimeringar
- **Kodkvalitet**: ESLint, Prettier och TypeScript strikt läge
- **Prestanda**: Bundle-analys och optimering
- **Responsiv design**: Mobil-först-approach med Tailwind CSS

### 🐛 Fixat
- Problem med spelstatushantering
- Problem med ljuduppspelning på mobila enheter
- Touch-kontrollernas responsivitet
- Minnesläckor i spelloopen
- Poängberäkningens noggrannhet

### 📱 PWA-funktioner
- Service Worker med offline-caching
- Web App Manifest med korrekta ikoner
- Installationsprompt för mobila enheter
- Bakgrundssynkroniseringsmöjligheter
- Push-notifikationsstöd

## [1.0.0] - 2024-12-01

### 🚀 Lagt till
- **Kärnspelmekanik**: Klassisk Tetris-spelupplevelse
  - Tetromino-rotation och rörelse
  - Radering och poängsättning
  - Nivåprogression
  - Hantering av game over
- **Användargränssnitt**: Modernt React-baserat UI
  - Rendering av spelplan
  - Poängvisning
  - Förhandsvisning av nästa pjäs
  - Spelkontroller
- **Ljud**: Grundläggande ljudeffekter
  - Rörelseljud
  - Ljud för radering
- **Responsiv design**: Stöd för mobil och desktop
- **Statushantering**: React-hooks för spelstatus

### 🔧 Teknisk implementation
- React 18 med TypeScript
- Tailwind CSS för styling
- Vite för utveckling och bygge
- Grundläggande testuppsättning med Vitest
- ESLint- och Prettier-konfiguration

## [0.1.0] - 2024-11-15

### 🚀 Lagt till
- **Projektuppsättning**: Initial projektstruktur
- **Grundläggande arkitektur**: Separation av frontend och backend
- **Utvecklingsmiljö**: Node.js-uppsättning med npm
- **Versionshantering**: Git-repository med initial commit
- **Dokumentation**: README och projektriktlinjer

---

## Versionshistorik

| Version | Datum | Huvudfunktioner | Status |
|---------|-------|------------------|---------|
| 2.0.0 | 2024-12-19 | PWA, CI/CD, Förbättrat ljud | ✅ Släppt |
| 1.0.0 | 2024-12-01 | Kärnspel, React UI | ✅ Släppt |
| 0.1.0 | 2024-11-15 | Projektuppsättning | ✅ Släppt |

## Migreringsguide

### Från v1.0.0 till v2.0.0

1. **PWA-installation**: Användare kan nu installera spelet som en native app
2. **Offline-stöd**: Spelet fungerar utan internetanslutning
3. **Förbättrat ljud**: Nya ljudeffekter och bakgrundsmusik
4. **Prestanda**: Förbättrade laddningstider och responsivitet

### Brytande ändringar

- Inga i denna version
- All befintlig funktionalitet bevarad
- Förbättrad med nya funktioner

## Bidrag

När du bidrar till detta projekt, vänligen:

1. Följ den befintliga kodstilen
2. Lägg till tester för ny funktionalitet
3. Uppdatera denna ändringslogg med dina ändringar
4. Använd konventionella commit-meddelanden

## Release-process

1. **Utveckling**: Funktioner utvecklas på `develop`-branch
2. **Testning**: Automatiserade tester körs på alla pull requests
3. **Granskning**: Kodgranskning och kvalitetskontroller
4. **Sammanslagning**: Godkända ändringar slås samman till `main`
5. **Distribution**: Automatisk distribution till GitHub Pages
6. **Release**: GitHub-release skapas med changelog

---

*Denna ändringslogg genereras och uppdateras automatiskt av vår CI/CD-pipeline.*
