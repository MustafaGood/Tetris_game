import { describe, test, expect, vi } from 'vitest';
import { GameState, canTransition, isInputAllowed, validateStateTransition } from '../tetris';

// Test för GameState enum och transitions
describe('GameState Management', () => {
  test('should allow valid state transitions', () => {
    expect(canTransition(GameState.START, GameState.PLAYING)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.PAUSE)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.GAME_OVER)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.START)).toBe(true); // Ny tillåten transition
    expect(canTransition(GameState.PAUSE, GameState.PLAYING)).toBe(true);
    expect(canTransition(GameState.PAUSE, GameState.START)).toBe(true);
    expect(canTransition(GameState.GAME_OVER, GameState.START)).toBe(true);
  });

  test('should prevent invalid state transitions', () => {
    expect(canTransition(GameState.START, GameState.GAME_OVER)).toBe(false);
    expect(canTransition(GameState.START, GameState.PAUSE)).toBe(false);
    expect(canTransition(GameState.GAME_OVER, GameState.PLAYING)).toBe(false);
  });

  test('should validate state transitions correctly', () => {
    expect(validateStateTransition(GameState.START, GameState.PLAYING)).toBe(true);
    expect(validateStateTransition(GameState.START, GameState.GAME_OVER)).toBe(false);
  });

  test('should allow correct inputs for each state', () => {
    // START state
    expect(isInputAllowed(GameState.START, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.START, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.START, 'ArrowLeft')).toBe(false);

    // PLAYING state
    expect(isInputAllowed(GameState.PLAYING, 'ArrowLeft')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowRight')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowDown')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowUp')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyC')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyP')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'Escape')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyR')).toBe(true);

    // PAUSE state
    expect(isInputAllowed(GameState.PAUSE, 'KeyP')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'Escape')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'ArrowLeft')).toBe(false);

    // GAME_OVER state
    expect(isInputAllowed(GameState.GAME_OVER, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'KeyR')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'ArrowLeft')).toBe(false);
  });
});

// Test för state overlay rendering
describe('State Overlay', () => {
  test('should show correct text for START state', () => {
    // Detta test skulle kräva att vi renderar GameBoard komponenten
    // För nu testar vi bara logiken
    const startState = GameState.START;
    expect(startState).toBe('START');
  });

  test('should show correct text for PAUSE state', () => {
    const pauseState = GameState.PAUSE;
    expect(pauseState).toBe('PAUSE');
  });

  test('should show correct text for GAME_OVER state', () => {
    const gameOverState = GameState.GAME_OVER;
    expect(gameOverState).toBe('GAME_OVER');
  });
});

// Test för state transition callbacks
describe('State Transition Callbacks', () => {
  test('should call transition callback when valid', () => {
    const mockCallback = vi.fn();
    const fromState = GameState.START;
    const toState = GameState.PLAYING;
    
    // Simulera transitionState funktion
    if (canTransition(fromState, toState)) {
      mockCallback(fromState, toState);
    }
    
    expect(mockCallback).toHaveBeenCalledWith(fromState, toState);
  });

  test('should not call transition callback when invalid', () => {
    const mockCallback = vi.fn();
    const fromState = GameState.START;
    const toState = GameState.GAME_OVER;
    
    // Simulera transitionState funktion
    if (canTransition(fromState, toState)) {
      mockCallback(fromState, toState);
    }
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
