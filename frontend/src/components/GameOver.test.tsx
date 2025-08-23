// Testverktyg och komponentimport
// Kommentarer på svenska för att förklara vad testen gör
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import GameOver from './GameOver';

// Mockar externa API-anrop så testerna inte gör riktiga nätverksförfrågningar
// Vi ersätter postScore, fetchScores och formatScore med mockfunktioner
vi.mock('../api', () => ({
  postScore: vi.fn(),
  fetchScores: vi.fn(),
  formatScore: vi.fn((score: number) => score.toString())
}));

describe('GameOver', () => {
  // Mockade props som skickas till komponenten i testerna
  const mockProps = {
    points: 1000,
    level: 5,
    lines: 25,
    backendConnected: true,
    onPlayAgain: vi.fn(),
    onMainMenu: vi.fn(),
    onScoreSaved: vi.fn()
  };

  // Rensar localStorage innan varje test så vi får en ren testmiljö
  beforeEach(() => {
    localStorage.clear();
  });

  // Test: komponenten visar Game Over och rätt statistik
  test('renders game over screen with correct stats', () => {
    render(<GameOver {...mockProps} />);
    
    // Förväntar att rubriken 'Game Over' finns
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    // Förväntar att poäng, nivå och rader visas korrekt
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText(/Nivå 5 • 25 rader/)).toBeInTheDocument();
  });

  // Test: när backend är ansluten ska knappen för att spara poäng synas
  test('shows save score button when backend is connected', () => {
    render(<GameOver {...mockProps} />);
    
    // Knappen för att spara poäng (svensk text i UI:t)
    expect(screen.getByText('Spara poäng online')).toBeInTheDocument();
  });

  // Test: när backend inte är ansluten ska spara-knappen inte visas
  test('does not show save score button when backend is disconnected', () => {
    render(<GameOver {...mockProps} backendConnected={false} />);
    
    // queryByText returnerar null om elementet inte finns
    expect(screen.queryByText('Spara poäng online')).not.toBeInTheDocument();
  });
});
