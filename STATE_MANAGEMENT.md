# Tetris Game State Management

## Översikt

Detta dokument beskriver den nya state-hanteringen för Tetris-spelet som implementerar en robust och validerad state machine.

## GameState Enum

```typescript
export enum GameState {
  START = 'START',           // Titelskärm eller "Press Start"
  PLAYING = 'PLAYING',       // Normalt spel
  PAUSE = 'PAUSE',          // Spelet fryst, väntar på återupptagning
  GAME_OVER = 'GAME_OVER'   // Slutskärm
}
```

## State Transitions

### Tillåtna övergångar

```typescript
ALLOWED_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.START]: [GameState.PLAYING],
  [GameState.PLAYING]: [GameState.PAUSE, GameState.GAME_OVER, GameState.START],
  [GameState.PAUSE]: [GameState.PLAYING, GameState.START],
  [GameState.GAME_OVER]: [GameState.START]
};
```

### State Transition Flöde

```
START → PLAYING → PAUSE → PLAYING
  ↓    ↕         ↓
GAME_OVER ← GAME_OVER
```

## Input Permissions

### START State
- **Tillåtna inputs**: `Enter`, `Space`
- **Funktion**: Starta spel

### PLAYING State
- **Tillåtna inputs**: `ArrowLeft`, `ArrowRight`, `ArrowDown`, `ArrowUp`, `Space`, `KeyC`, `KeyP`, `Escape`, `KeyR`
- **Funktion**: Full spelkontroll
- **Escape**: Avsluta spel och gå tillbaka till meny

### PAUSE State
- **Tillåtna inputs**: `KeyP`, `Escape`, `Enter`
- **Funktion**: Pausa/resume och navigering

### GAME_OVER State
- **Tillåtna inputs**: `Enter`, `Space`, `KeyR`
- **Funktion**: Restart och meny-navigering

## Implementation

### setState Funktion

```typescript
const setState = useCallback((newState: GameState) => {
  const validTransition = transitionState(gameState, newState, (from, to) => {
    console.log(`State transition: ${from} -> ${to}`);
    
    // Hantera specifika state transitions
    switch (to) {
      case GameState.PLAYING:
        if (from === GameState.START) {
          reset(); // Nollställ spelet vid start
        }
        setPaused(false);
        break;
      case GameState.PAUSE:
        setPaused(true);
        // Nollställ lock delay timer vid paus
        if (lockDelayTimer) {
          clearTimeout(lockDelayTimer);
          setLockDelayTimer(null);
        }
        setIsLocked(false);
        break;
      case GameState.GAME_OVER:
        setOver(true);
        setPaused(false);
        // Stoppa alla timers
        if (lockDelayTimer) {
          clearTimeout(lockDelayTimer);
          setLockDelayTimer(null);
        }
        break;
      case GameState.START:
        setPaused(false);
        setOver(false);
        // Nollställ alla timers
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

### Validering

```typescript
// Kontrollera om transition är tillåten
export function canTransition(from: GameState, to: GameState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
}

// Validera state transition
export function validateStateTransition(from: GameState, to: GameState): boolean {
  if (!canTransition(from, to)) {
    console.warn(`Invalid state transition: ${from} -> ${to}`);
    return false;
  }
  return true;
}

// Input validering
export function isInputAllowed(state: GameState, key: string): boolean {
  return INPUT_PERMISSIONS[state]?.includes(key) || false;
}
```

## Visual Feedback

### State Overlay

GameBoard-komponenten visar nu en overlay som indikerar aktuellt state:

- **START**: "Tryck Start för att börja" (blå)
- **PAUSE**: "PAUSAT" (gul)
- **GAME_OVER**: "GAME OVER" (röd)

### Paus Overlay

När spelet är pausat visas en overlay med:
- Mörkläggning av spelplanen
- Tydlig "Pausat" text
- Instruktioner för att fortsätta

## Timer Management

### Lock Delay Timer

Lock delay timern nollställs automatiskt vid:
- State transition till PAUSE
- State transition till GAME_OVER
- State transition till START

### Spelloop

Spelloopen körs endast när `gameState === GameState.PLAYING`:
```typescript
useGameLoop(() => {
  if (gameState === GameState.PLAYING) {
    softDrop();
  }
}, gameState === GameState.PLAYING, tickSpeed(level));
```

## Tester

### State Transition Tester

```typescript
test('should allow valid state transitions', () => {
  expect(canTransition(GameState.START, GameState.PLAYING)).toBe(true);
  expect(canTransition(GameState.PLAYING, GameState.PAUSE)).toBe(true);
  // ...
});
```

### Input Permission Tester

```typescript
test('should allow correct inputs for each state', () => {
  expect(isInputAllowed(GameState.START, 'Enter')).toBe(true);
  expect(isInputAllowed(GameState.START, 'ArrowLeft')).toBe(false);
  // ...
});
```

## Fördelar med den nya implementationen

1. **Validerade transitions**: Endast tillåtna state-övergångar är möjliga
2. **Tydlig input-kontroll**: Varje state har definierade tillåtna inputs
3. **Automatisk timer-hantering**: Timers nollställs korrekt vid state-övergångar
4. **Visual feedback**: Tydlig indikation av aktuellt state
5. **Testbar kod**: Omfattande tester för state-logiken
6. **Förhindrar buggar**: Ogiltiga state-övergångar och inputs blockeras

## Problemlösning

### Vanliga state transition problem

1. **"Invalid state transition: PLAYING -> START"**
   - **Orsak**: Försök att gå från PLAYING till START utan att gå via PAUSE först
   - **Lösning**: Uppdatera ALLOWED_TRANSITIONS för att tillåta PLAYING -> START
   - **Användning**: När spelaren vill avsluta spelet direkt från PLAYING state

2. **Input blockeras i fel state**
   - **Orsak**: Input permissions är för restriktiva
   - **Lösning**: Uppdatera INPUT_PERMISSIONS för aktuellt state
   - **Verifiering**: Använd `isInputAllowed(state, key)` för att testa

3. **Timers fortsätter köra efter state transition**
   - **Orsak**: Timers nollställs inte korrekt vid state transition
   - **Lösning**: Lägg till timer cleanup i setState callback
   - **Exempel**: Lock delay timer nollställs vid PAUSE och GAME_OVER

## Användning

### Grundläggande state-hantering

```typescript
// Starta spel
setState(GameState.PLAYING);

// Pausa spel
setState(GameState.PAUSE);

// Game over
setState(GameState.GAME_OVER);

// Återgå till start
setState(GameState.START);
```

### Input-hantering

```typescript
// Kontrollera om input är tillåten
if (isInputAllowed(gameState, 'ArrowLeft')) {
  // Hantera input
}
```

### State transition med callback

```typescript
const newState = transitionState(currentState, targetState, (from, to) => {
  console.log(`Transitioned from ${from} to ${to}`);
  // Utför ytterligare åtgärder vid transition
});
```
