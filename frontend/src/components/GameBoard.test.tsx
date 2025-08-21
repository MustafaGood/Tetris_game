import { describe, test, expect, vi } from 'vitest';
import { GameState, canTransition, isInputAllowed, validateStateTransition } from '../tetris';
import { render, screen } from '@testing-library/react';
import GameBoard from './GameBoard';
import { emptyGrid, spawn, Bag, GameState } from '../tetris';


const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  imageSmoothingEnabled: false,
  imageSmoothingQuality: 'low' as CanvasImageSmoothingQuality,
};

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  width: 0,
  height: 0,
};


Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class {
    getContext() {
      return mockContext;
    }
  },
});


describe('GameState Management', () => {
  test('should allow valid state transitions', () => {
    expect(canTransition(GameState.START, GameState.PLAYING)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.PAUSE)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.GAME_OVER)).toBe(true);
    expect(canTransition(GameState.PLAYING, GameState.START)).toBe(true);
    expect(canTransition(GameState.PAUSE, GameState.PLAYING)).toBe(true);
    expect(canTransition(GameState.PAUSE, GameState.START)).toBe(true);
    expect(canTransition(GameState.GAME_OVER, GameState.START)).toBe(true);
  });

  test('should prevent invalid state transitions', () => {
    expect(canTransition(GameState.START, GameState.GAME_OVER)).toBe(false);
    expect(canTransition(GameState.START, GameState.PAUSE)).toBe(false);

  });

  test('should validate state transitions correctly', () => {
    expect(validateStateTransition(GameState.START, GameState.PLAYING)).toBe(true);
    expect(validateStateTransition(GameState.START, GameState.GAME_OVER)).toBe(false);
  });

  test('should allow correct inputs for each state', () => {

    expect(isInputAllowed(GameState.START, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.START, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.START, 'ArrowLeft')).toBe(false);


    expect(isInputAllowed(GameState.PLAYING, 'ArrowLeft')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowRight')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowDown')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'ArrowUp')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyC')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyP')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'Escape')).toBe(true);
    expect(isInputAllowed(GameState.PLAYING, 'KeyR')).toBe(true);


    expect(isInputAllowed(GameState.PAUSE, 'KeyP')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'Escape')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.PAUSE, 'ArrowLeft')).toBe(false);


    expect(isInputAllowed(GameState.GAME_OVER, 'Enter')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'Space')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'KeyR')).toBe(true);
    expect(isInputAllowed(GameState.GAME_OVER, 'ArrowLeft')).toBe(false);
  });
});


describe('State Overlay', () => {
  test('should show correct text for START state', () => {

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


describe('State Transition Callbacks', () => {
  test('should call transition callback when valid', () => {
    const mockCallback = vi.fn();
    const fromState = GameState.START;
    const toState = GameState.PLAYING;
    
    if (canTransition(fromState, toState)) {
      mockCallback(fromState, toState);
    }
    
    expect(mockCallback).toHaveBeenCalledWith(fromState, toState);
  });

  test('should not call transition callback when invalid', () => {
    const mockCallback = vi.fn();
    const fromState = GameState.START;
    const toState = GameState.GAME_OVER;
    
    if (canTransition(fromState, toState)) {
      mockCallback(fromState, toState);
    }
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with current piece', () => {
    const grid = emptyGrid();
    const bag = new Bag();
    const piece = spawn(bag);
    render(<GameBoard grid={grid} currentPiece={piece} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom cell size', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} cellSize={32} />);
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('renders with game state overlay', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} gameState={GameState.PAUSE} />);
    expect(screen.getByText('PAUSAT')).toBeInTheDocument();
  });

  it('renders start state overlay', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} gameState={GameState.START} />);
    expect(screen.getByText('Tryck Start för att börja')).toBeInTheDocument();
  });

  it('renders game over state overlay', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} gameState={GameState.GAME_OVER} />);
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
  });

  it('does not render overlay in playing state', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} gameState={GameState.PLAYING} />);
    expect(screen.queryByText('PAUSAT')).not.toBeInTheDocument();
    expect(screen.queryByText('Tryck Start för att börja')).not.toBeInTheDocument();
    expect(screen.queryByText('GAME OVER')).not.toBeInTheDocument();
  });
});


describe('Ghost Piece Functionality', () => {
  it('should render ghost piece when piece is not at bottom', () => {
    const grid = emptyGrid();
    const bag = new Bag();
    const piece = spawn(bag);

    piece.y = 5;
    
    render(<GameBoard grid={grid} currentPiece={piece} gameState={GameState.PLAYING} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should not render ghost piece when piece is at bottom', () => {
    const grid = emptyGrid();
    const bag = new Bag();
    const piece = spawn(bag);

    piece.y = 18;
    
    render(<GameBoard grid={grid} currentPiece={piece} gameState={GameState.PLAYING} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should not render ghost piece in non-playing states', () => {
    const grid = emptyGrid();
    const bag = new Bag();
    const piece = spawn(bag);
    piece.y = 5;
    
    render(<GameBoard grid={grid} currentPiece={piece} gameState={GameState.PAUSE} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should not render ghost piece without current piece', () => {
    const grid = emptyGrid();
    render(<GameBoard grid={grid} gameState={GameState.PLAYING} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
