# Frontend Modulstruktur

Detta dokument beskriver den modulära arkitekturen för Tetris-frontend-applikationen.

## Översikt

Frontend är organiserad i logiska moduler för bättre underhållbarhet, testbarhet och skalbarhet. Varje modul kapslar in relaterad funktionalitet och kan utvecklas, testas och underhållas oberoende.

## Modulorganisation

```
src/
├── modules/
│   ├── core/           # Core game logic and state
│   ├── ui/            # Reusable UI components
│   ├── audio/         # Audio management system
│   ├── storage/       # Local storage and persistence
│   ├── network/       # API communication
│   └── utils/         # Utility functions and helpers
├── components/         # Page-level components
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── styles/            # Global styles and themes
```

## Modulbeskrivningar

### Kärnmodul (`/core`)
- **Spelmotor**: Kärnlogik för Tetris-spelet
- **Statushantering**: Spelstatus och reducers
- **Spelregler**: Poängsättning, nivåer och mekanik
- **Planlogik**: Rutnätshantering och pjäsplacering

### UI-modul (`/ui`)
- **Komponenter**: Återanvändbara UI-komponenter
- **Layouts**: Sidlayout och containrar
- **Teman**: Designsystem och tematisering
- **Animationer**: CSS-animationer och övergångar

### Ljudmodul (`/audio`)
- **Ljudhanterare**: Ljuduppspelning och kontroll
- **Ljudtillgångar**: Hantering av ljudeffekter och musik
- **Volymkontroll**: Användarinställningar och preferenser
- **Ljudkontext**: Web Audio API-integration

### Lagringsmodul (`/storage`)
- **Lokal lagring**: Spelframsteg och inställningar
- **Cache-hantering**: Strategier för tillgångscaching
- **Datapersistens**: Spara/ladda spelstatus
- **Offline-stöd**: Service worker-integration

### Nätverksmodul (`/network`)
- **API-klient**: HTTP-förfrågningshantering
- **Felhantering**: Hantering av nätverksfel
- **Caching**: Strategier för svarcaching
- **Offline-kö**: Hantering av väntande förfrågningar

### Verktygsmodul (`/utils`)
- **Hjälpfunktioner**: Vanliga verktygsfunktioner
- **Konstanter**: Applikationskonstanter
- **Validering**: Hjälpfunktioner för inputvalidering
- **Formatering**: Verktyg för dataformatering

## Fördelar med modulär struktur

1. **Underhållbarhet**: Tydlig separation av ansvar
2. **Testbarhet**: Isolerad testning av moduler
3. **Återanvändbarhet**: Moduler kan återanvändas över funktioner
4. **Skalbarhet**: Enkelt att lägga till nya moduler
5. **Teamutveckling**: Flera utvecklare kan arbeta på olika moduler
6. **Kodorganisation**: Logisk gruppering av relaterad funktionalitet

## Modulutvecklingsriktlinjer

### Skapa en ny modul

1. Skapa en ny mapp i `/modules`
2. Inkludera en `index.ts`-fil för exports
3. Lägg till modulspecifika typer i `/types`
4. Skapa omfattande tester
5. Uppdatera denna README

### Modulberoenden

- Moduler ska ha minimala beroenden av andra moduler
- Använd beroendeinjektion när möjligt
- Undvik cirkulära beroenden
- Håll moduler löst kopplade

### Testning av moduler

- Varje modul ska ha sitt eget testsuite
- Testa modulgränser och gränssnitt
- Mocka externa beroenden
- Säkerställ bra testtäckning

## Exempel på modulstruktur

```typescript
// modules/core/index.ts
export * from './game-engine';
export * from './game-state';
export * from './game-rules';

// modules/core/game-engine.ts
export class GameEngine {
  // Game engine implementation
}

// modules/core/types.ts
export interface GameState {
  // Game state types
}
```

## Migration från monolitisk struktur

Den modulära strukturen introducerades i version 2.0.0. Befintlig kod har refaktorerats för att passa denna nya organisation:

- **Före**: All spellogik i enskilda filer
- **Efter**: Separerad i fokuserade moduler
- **Fördelar**: Bättre organisation och underhållbarhet

## Framtida förbättringar

- **Plugin-system**: Tillåt moduler att laddas dynamiskt
- **Modulregister**: Centraliserad modulhantering
- **Lazy loading**: Ladda moduler vid behov
- **Modulversionshantering**: Versionskontroll för moduler

---

För mer information om specifika moduler, se deras individuella README-filer.
