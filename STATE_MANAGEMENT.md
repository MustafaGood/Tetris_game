# State-hantering för Tetris

<!-- Kommentar: Denna fil beskriver frontendens state machine, dess övergångar och hur timers/input hanteras. -->

## Översikt

Dokumentet beskriver en robust och testbar state-machine för spelet. Det förklarar tillåtna state-övergångar, input-behörigheter per state, timer-hantering och hur frontend bör interagera med backend vid t.ex. poänginlämning.

## GameState

```typescript
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSE = 'PAUSE',
  GAME_OVER = 'GAME_OVER'
}
```

<!-- Kommentar: Håll enumen oförändrad så att komponenter och tester kan dela typen. -->

## Tillåtna övergångar

```typescript
const ALLOWED_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.START]: [GameState.PLAYING],
  [GameState.PLAYING]: [GameState.PAUSE, GameState.GAME_OVER, GameState.START],
  [GameState.PAUSE]: [GameState.PLAYING, GameState.START],
  [GameState.GAME_OVER]: [GameState.START]
};
```

Grafiskt flöde (förenklat):

START → PLAYING → PAUSE → PLAYING
  ↓                ↓
  →----------- GAME_OVER

<!-- Kommentar: Ändra ALLOWED_TRANSITIONS om nya navigationsvägar behövs (t.ex. direkt avslut). -->

## Input-behörigheter per state

- START: `Enter`, `Space` — starta spelet
- PLAYING: `ArrowLeft`, `ArrowRight`, `ArrowDown`, `ArrowUp`, `Space`, `KeyC`, `KeyP`, `Escape`, `KeyR` — full spelkontroll
- PAUSE: `KeyP`, `Escape`, `Enter` — pausa/återuppta och navigera
- GAME_OVER: `Enter`, `Space`, `KeyR` — starta om eller gå till meny

Funktionen `isInputAllowed(state, key)` används för att validera inputs innan de bearbetas.

## setState — implementationsexempel

```typescript
const setState = useCallback((newState: GameState) => {
  const validTransition = transitionState(gameState, newState, (from, to) => {
    console.log(`State transition: ${from} -> ${to}`);
    switch (to) {
      case GameState.PLAYING:
        if (from === GameState.START) {
          reset();
        }
        setPaused(false);
        break;
      case GameState.PAUSE:
        setPaused(true);
        if (lockDelayTimer) {
          clearTimeout(lockDelayTimer);
          setLockDelayTimer(null);
        }
        setIsLocked(false);
        break;
      case GameState.GAME_OVER:
        setOver(true);
        setPaused(false);
        if (lockDelayTimer) {
          clearTimeout(lockDelayTimer);
          setLockDelayTimer(null);
        }
        break;
      case GameState.START:
        setPaused(false);
        setOver(false);
        if (lockDelayTimer) {
          clearTimeout(lockDelayTimer);
          setLockDelayTimer(null);
        }
        break;
    }
  });

  if (validTransition) {
    setGameState(validTransition);
  }
}, [gameState, reset, lockDelayTimer]);
```

<!-- Kommentar: setState centraliserar timers och side-effects så att komponenterna förblir rena. -->

## Valideringshjälpare

```typescript
export function canTransition(from: GameState, to: GameState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
}

export function validateStateTransition(from: GameState, to: GameState): boolean {
  if (!canTransition(from, to)) {
    console.warn(`Invalid state transition: ${from} -> ${to}`);
    return false;
  }
  return true;
}

export function isInputAllowed(state: GameState, key: string): boolean {
  return INPUT_PERMISSIONS[state]?.includes(key) || false;
}
```

## Visual feedback

GameBoard visar overlay för aktuellt state:

- START: instruktion att börja
- PAUSE: tydlig paus-indikator
- GAME_OVER: game over och statistik

Overlay-styling hanteras i komponenterna (t.ex. `GameBoard.tsx`) och bör hållas separerad från state-logiken.

## Timers och spelloop

- Lock delay-timern nollställs vid övergång till `PAUSE`, `GAME_OVER` och `START`.
- Spelloopen kör uppdateringar endast när `gameState === GameState.PLAYING`:

```typescript
useGameLoop(() => {
  if (gameState === GameState.PLAYING) {
    softDrop();
  }
}, gameState === GameState.PLAYING, tickSpeed(level));
```

## Tester

Enhetstester täcker state-övergångar och input-permission:

```typescript
test('should allow valid state transitions', () => {
  expect(canTransition(GameState.START, GameState.PLAYING)).toBe(true);
  expect(canTransition(GameState.PLAYING, GameState.PAUSE)).toBe(true);
});

test('should allow correct inputs for each state', () => {
  expect(isInputAllowed(GameState.START, 'Enter')).toBe(true);
  expect(isInputAllowed(GameState.START, 'ArrowLeft')).toBe(false);
});
```

## Fördelar

- Validerade övergångar minskar buggar
- Tydlig inputkontroll per state
- Centraliserad timer-hantering
- Bra testbarhet och enklare felsökning

## Vanliga problem och lösningar

1) Invalid state transition
- Kontrollera `ALLOWED_TRANSITIONS` och loggarna

2) Input blockeras i fel state
- Uppdatera `INPUT_PERMISSIONS` och kör enhetstester

3) Timers som inte rensas
- Säkerställ att cleanup körs i `setState` för relevanta states

## Interaktion med backend

- När spelaren når `GAME_OVER` bör frontend försöka spara poängen via backend (POST `/api/scores`).
- Skicka ett vältaligt dataschema: { name, points, level, lines, gameSeed?, duration? }.
- Om backend saknas eller returnerar fel, spara lokalt i `localStorage` som fallback.

<!-- Kommentar: Se även `frontend/COMPONENTS_README.md` för hur GameOver-komponenten hanterar sparning och återkoppling. -->

## Exempel på användning

```typescript
setState(GameState.PLAYING);
setState(GameState.PAUSE);
setState(GameState.GAME_OVER);
setState(GameState.START);
```

```typescript
if (isInputAllowed(gameState, 'ArrowLeft')) {
  // hantera vänster-rörelse
}
```

<!-- Kommentar: Behöver du att jag lägger till specifika tester eller justerar INPUT_PERMISSIONS? -->
