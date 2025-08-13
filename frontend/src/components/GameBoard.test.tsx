import React from 'react';
import { render, screen } from '@testing-library/react';
import GameBoard from './GameBoard';
import { emptyGrid, Grid } from '../tetris';

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  imageSmoothingEnabled: false,
  imageSmoothingQuality: '',
};

const mockCanvas = {
  getContext: jest.fn(() => mockContext),
  width: 0,
  height: 0,
};

// Mock canvas element
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockContext),
});

describe('GameBoard Canvas Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders canvas element', () => {
    const grid: Grid = emptyGrid();
    render(<GameBoard grid={grid} />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  test('sets correct canvas dimensions', () => {
    const grid: Grid = emptyGrid();
    const cellSize = 24;
    const expectedWidth = 10 * cellSize; // 10 columns
    const expectedHeight = 20 * cellSize; // 20 rows;
    
    render(<GameBoard grid={grid} cellSize={cellSize} />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveStyle({
      width: `${expectedWidth}px`,
      height: `${expectedHeight}px`,
    });
  });

  test('handles empty grid correctly', () => {
    const grid: Grid = emptyGrid();
    render(<GameBoard grid={grid} />);
    
    // Canvas should render without errors
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('handles grid with pieces', () => {
    const grid: Grid = emptyGrid();
    // Add a piece to the grid
    grid[0][0] = 1; // I-piece in top-left corner
    
    render(<GameBoard grid={grid} />);
    
    // Canvas should render without errors
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('handles current piece', () => {
    const grid: Grid = emptyGrid();
    const currentPiece = { id: 1, r: 0, x: 3, y: 0 };
    
    render(<GameBoard grid={grid} currentPiece={currentPiece} />);
    
    // Canvas should render without errors
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const grid: Grid = emptyGrid();
    render(<GameBoard grid={grid} />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveClass('border-2', 'border-gray-700', 'rounded-xl', 'shadow-2xl');
  });

  test('handles different cell sizes', () => {
    const grid: Grid = emptyGrid();
    const cellSize = 32;
    const expectedWidth = 10 * cellSize;
    const expectedHeight = 20 * cellSize;
    
    render(<GameBoard grid={grid} cellSize={cellSize} />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveStyle({
      width: `${expectedWidth}px`,
      height: `${expectedHeight}px`,
    });
  });
});
