# Nya React-komponenter för Tetris-spelet

<!-- Kommentar: Denna README förklarar komponenterna i frontend som integrerar mot backend-API:et. -->

## Översikt

Denna fil beskriver nyare React-komponenter som används för att visa spelstatistik, hantera game-over och visa topplistor. Målet är att förklara komponenternas ansvar, hur de kommunicerar med backend, och hur lokal lagring används som fallback.

<!-- Kommentar: Dela upp i komponentbeskrivningar, integrationsexempel, API-anrop och drift/validering. -->

## Komponenter

### 1. GameOver-komponenten (`src/components/GameOver.tsx`)

<!-- Kommentar: GameOver ansvarar för att presentera slutresultatet och erbjuda sparfunktionalitet. -->

Syfte: Visar slutlig poänginformation och låter spelaren spara sitt resultat antingen online (backend) eller lokalt (localStorage).

Funktioner:
- Visar poäng, nivå och antal rader
- Kontrollerar och markerar lokala highscores
- Tillåter spelaren att ange ett namn för sparning
- Skickar poäng till backend via API (om servern är tillgänglig)
- Sparar som fallback i localStorage om nätverket saknas
- Visar tydliga felmeddelanden och statusindikatorer
- Exponerar callback-funktioner för "spela igen" och "gå till huvudmeny"

Props:
```typescript
interface GameOverProps {
  points: number;
  level: number;
  lines: number;
  backendConnected: boolean | null; // null = okänt, true/false = status
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onScoreSaved?: (scores: Score[]) => void; // valfri callback efter lyckad sparning
}
```

Exempel på användning:
```tsx
<GameOver
  points={1000}
  level={5}
  lines={25}
  backendConnected={true}
  onPlayAgain={() => startGame()}
  onMainMenu={() => goToMainMenu()}
  onScoreSaved={(scores) => updateScoreList(scores)}
/>
```

### 2. Leaderboard-komponenten (`src/components/Leaderboard.tsx`)

<!-- Kommentar: Leaderboard hämtar och visar både online- och lokala topplistor. -->

Syfte: Hämtar och visar topplistor, kombinerar online-scores från backend med lokala highscores, och erbjuder borttagningsfunktion för online-scores.

Funktioner:
- Hämtar topplistan från backend när anslutning finns
- Visar lokala highscores från localStorage som fallback
- Möjlighet att ta bort online-scores (om backend tillåter)
- Visar laddningsindikatorer och felmeddelanden
- Anpassad layout för olika skärmstorlekar med scrollning

Props:
```typescript
interface LeaderboardProps {
  backendConnected: boolean | null;
  onBack: () => void;
  onScoreDeleted?: (scores: Score[]) => void;
}
```

Exempel på användning:
```tsx
<Leaderboard
  backendConnected={true}
  onBack={() => goBack()}
  onScoreDeleted={(scores) => updateScoreList(scores)}
/>
```

## Integration med `App.tsx`

### Game Over-hantering

I `App.tsx` ersätter `GameOver` den tidigare inbyggda game-over-logiken. Komponentens callbacks hanterar ljudinitialisering och navigering tillbaka till startmenyn.

Exempel:
```tsx
if (gameState === GameState.GAME_OVER) {
  return (
    <>
      <AnimatedBackground />
      <GameOver
        points={points}
        level={level}
        lines={lines}
        backendConnected={backendConnected}
        onPlayAgain={async () => {
          await initializeAudio();
          startGame();
        }}
        onMainMenu={async () => {
          await initializeAudio();
          setState(GameState.START);
          setUiState('menu');
        }}
        onScoreSaved={(updatedScores) => setScores(updatedScores)}
      />
    </>
  );
}
```

### Highscores-hantering

När användaren går till highscores visas `Leaderboard` med möjlighet att gå tillbaka till huvudmenyn.

Exempel:
```tsx
if (uiState === 'highscores') {
  return (
    <>
      <AnimatedBackground />
      <Leaderboard
        backendConnected={backendConnected}
        onBack={async () => {
          await initializeAudio();
          setUiState('menu');
        }}
        onScoreDeleted={(updatedScores) => setScores(updatedScores)}
      />
    </>
  );
}
```

## API-anrop och beteende

Följande endpoints används av komponenterna när backend är tillgänglig:

- POST /api/scores — skapa en ny score (används av `GameOver`)
- GET /api/scores/top — hämta topplistan (används av `Leaderboard`)
- DELETE /api/scores/:id — ta bort en score (används av `Leaderboard`)

Exempel på POST-anrop från `GameOver`:
```typescript
const result = await postScore({
  name: playerName.trim(),
  points,
  level,
  lines,
});
```

Exempel på GET-anrop från `Leaderboard`:
```typescript
const scores = await fetchScores(100);
```

Exempel på DELETE-anrop från `Leaderboard`:
```typescript
const result = await deleteScore(scoreId);
```

<!-- Kommentar: Se `frontend/src/api.ts` för implementationsdetaljer kring dessa funktioner. -->

## Felhantering och fallback

Viktiga riktlinjer som komponenterna följer:

- Kontrollera `backendConnected` innan försök att skriva till servern.
- Vid nätverksfel eller serverfel visas användarvänliga felmeddelanden.
- Lokal lagring (`localStorage`) används som fallback för att inte förlora resultat.
- Input valideras innan API-anrop för att förhindra ogiltiga data.

## Lokal lagring

Funktionen nedan visar hur lokala highscores sparas som fallback. Listan hålls sorterad och begränsas till de 10 bästa resultaten.

```typescript
const saveLocalScore = () => {
  const localScores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
  const newScore = {
    id: Date.now(),
    playerName: playerName.trim(),
    score: points,
    level,
    lines,
    date: new Date().toISOString(),
  };

  localScores.push(newScore);
  localScores.sort((a, b) => b.score - a.score);

  if (localScores.length > 10) {
    localScores.splice(10);
  }

  localStorage.setItem('tetrisScores', JSON.stringify(localScores));
};
```

<!-- Kommentar: Använd samma dataformat både lokalt och för backend så att listor kan slås ihop enkelt. -->

## Styling

Komponenterna använder Tailwind CSS och följer spelets visuella riktlinjer:

- Mörkt tema med gråskalor
- Responsiv layout
- Konsekventa övergångar och fokusstilar

## Testning

Enkla enhetstester finns för vissa komponenter (t.ex. `GameOver`) som kontrollerar rendering, visning av statistik och beteende beroende på backend-status.

## Förslag på framtida förbättringar

- Realtidsuppdateringar via WebSocket för live topplistor
- Flera topplistor (ex. per svårighetsgrad)
- Mer detaljerad statistik och grafer
- Offline-first-läge med Service Worker
- Internationellering (i18n)

<!-- Kommentar: För större förbättringar skapa separata issue/PR och inkludera små tester för nya funktioner. -->
