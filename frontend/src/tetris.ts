
// Cell: 0 = tom, 1..7 = olika tetromino
export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0 = tomt, 1..7 = tetromino färg/id
// Grid: Spelplanen, tvådimensionell array
export type Grid = Cell[][]; // [y][x]

// Bredd och höjd på spelplanen
export const W = 10, H = 20;

// Tetromino-färger för bättre visuell representation
export const TETROMINO_COLORS = {
  1: '#00f5ff', // I - Cyan
  2: '#0000ff', // J - Blue
  3: '#ff7f00', // L - Orange
  4: '#ffff00', // O - Yellow
  5: '#00ff00', // S - Green
  6: '#8000ff', // T - Purple
  7: '#ff0000', // Z - Red
};

// Definition av alla tetromino-former och deras rotationer
const SHAPES: Record<number, number[][][]> = {
  1: [ // I-formen
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  2: [ // J-formen
    [[2,0,0],[2,2,2],[0,0,0]],
    [[0,2,2],[0,2,0],[0,2,0]],
    [[0,0,0],[2,2,2],[0,0,2]],
    [[0,2,0],[0,2,0],[2,2,0]],
  ],
  3: [ // L-formen
    [[0,0,3],[3,3,3],[0,0,0]],
    [[0,3,0],[0,3,0],[0,3,3]],
    [[0,0,0],[3,3,3],[3,0,0]],
    [[3,3,0],[0,3,0],[0,3,0]],
  ],
  4: [ // O-formen
    [[4,4],[4,4]],
  ],
  5: [ // S-formen
    [[0,5,5],[5,5,0],[0,0,0]],
    [[0,5,0],[0,5,5],[0,0,5]],
    [[0,0,0],[0,5,5],[5,5,0]],
    [[5,0,0],[5,5,0],[0,5,0]],
  ],
  6: [ // T-formen
    [[0,6,0],[6,6,6],[0,0,0]],
    [[0,6,0],[0,6,6],[0,6,0]],
    [[0,0,0],[6,6,6],[0,6,0]],
    [[0,6,0],[6,6,0],[0,6,0]],
  ],
  7: [ // Z-formen
    [[7,7,0],[0,7,7],[0,0,0]],
    [[0,0,7],[0,7,7],[0,7,0]],
    [[0,0,0],[7,7,0],[0,7,7]],
    [[0,7,0],[7,7,0],[7,0,0]],
  ],
};

// Typ för ett block (tetromino)
export type Piece = { id: number; r: number; x: number; y: number };

// Skapar en tom spelplan
export function emptyGrid(): Grid {
  return Array.from({ length: H }, () => Array(W).fill(0) as Cell[]);
}

// "Bag"-systemet för att slumpa block (7-bag system för bättre balans)
export class Bag {
  private bag: number[] = [];
  private history: number[] = [];

  next(): number {
    if (this.bag.length === 0) {
      this.bag = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5);
    }
    const piece = this.bag.pop()!;
    this.history.push(piece);
    
    // Behåll bara de senaste 14 pjäserna i historiken
    if (this.history.length > 14) {
      this.history.shift();
    }
    
    return piece;
  }

  // Kontrollera om en pjäs finns i historiken (för att undvika för många samma pjäser)
  hasInHistory(pieceId: number): boolean {
    return this.history.includes(pieceId);
  }

  // Återställ bag (används vid nytt spel)
  reset(): void {
    this.bag = [];
    this.history = [];
  }
}

// Skapar ett nytt block
export function spawn(bag: Bag): Piece {
  const id = bag.next();
  const r = 0;
  const x = Math.floor(W/2) - 2;
  const y = 0;
  return { id, r, x, y };
}

// Klonar ett objekt (används för att kopiera spelplanen)
export function clone<T>(v: T): T { 
  return JSON.parse(JSON.stringify(v)); 
}

// Returnerar formen för ett block med aktuell rotation
export function shape(p: Piece): number[][] { 
  return SHAPES[p.id][p.r % SHAPES[p.id].length]; 
}

// Kontrollerar om ett block krockar med väggar eller andra block
export function collide(grid: Grid, p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;
      const x = p.x + dx, y = p.y + dy;
      if (x < 0 || x >= W || y >= H) return true;
      if (y >= 0 && grid[y][x]) return true;
    }
  }
  return false;
}

// Förbättrad kollisionsdetektering - specifika funktioner
export function collideWithWalls(p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;
      const x = p.x + dx;
      if (x < 0 || x >= W) return true;
    }
  }
  return false;
}

export function collideWithBottom(p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;
      const y = p.y + dy;
      if (y >= H) return true;
    }
  }
  return false;
}

export function collideWithBlocks(grid: Grid, p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;
      const x = p.x + dx, y = p.y + dy;
      if (y >= 0 && y < H && x >= 0 && x < W && grid[y][x]) return true;
    }
  }
  return false;
}

// Kollisionsdetektering i specifika riktningar
export function canMoveLeft(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, x: p.x - 1 };
  return !collide(grid, testPiece);
}

export function canMoveRight(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, x: p.x + 1 };
  return !collide(grid, testPiece);
}

export function canMoveDown(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, y: p.y + 1 };
  return !collide(grid, testPiece);
}

// Kontrollerar om pjäsen är "landed" (kan inte falla längre)
export function isLanded(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, y: p.y + 1 };
  return collide(grid, testPiece);
}

// Säkerställer att inga block överlappar varandra
export function validateGrid(grid: Grid): boolean {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = grid[y][x];
      if (cell !== 0 && (cell < 1 || cell > 7)) {
        return false; // Ogiltig cell-värde
      }
    }
  }
  return true;
}

// Lägger till ett block på spelplanen
export function merge(grid: Grid, p: Piece): void {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (s[dy][dx]) {
        const x = p.x + dx, y = p.y + dy;
        if (y >= 0 && y < H && x >= 0 && x < W) {
          grid[y][x] = p.id as Cell;
        }
      }
    }
  }
}

// Upptäcker fulla rader och returnerar deras index
export function getFullRows(grid: Grid): number[] {
  const fullRows: number[] = [];
  for (let y = 0; y < H; y++) {
    if (grid[y].every(c => c !== 0)) {
      fullRows.push(y);
    }
  }
  return fullRows;
}

// Rensar specifika rader och applicerar gravity
export function clearRows(grid: Grid, rows: number[]): void {
  if (rows.length === 0) return;
  
  // Sortera raderna i fallande ordning för att undvika index-problem
  const sortedRows = [...rows].sort((a, b) => b - a);
  
  // Ta bort de fulla raderna
  for (const rowIndex of sortedRows) {
    grid.splice(rowIndex, 1);
  }
  
  // Lägg till tomma rader högst upp (gravity)
  for (let i = 0; i < rows.length; i++) {
    grid.unshift(Array(W).fill(0) as Cell[]);
  }
}

// Förbättrad clearLines funktion som använder de nya funktionerna
export function clearLines(grid: Grid): number {
  const fullRows = getFullRows(grid);
  clearRows(grid, fullRows);
  return fullRows.length;
}

// Kontrollerar om gravity behöver appliceras
export function needsGravity(grid: Grid): boolean {
  for (let y = H - 1; y > 0; y--) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] === 0 && grid[y - 1][x] !== 0) {
        return true; // Det finns ett hål som behöver fylla
      }
    }
  }
  return false;
}

// Applicerar gravity till griden
export function applyGravity(grid: Grid): void {
  let moved = true;
  while (moved) {
    moved = false;
    for (let y = H - 1; y > 0; y--) {
      for (let x = 0; x < W; x++) {
        if (grid[y][x] === 0 && grid[y - 1][x] !== 0) {
          grid[y][x] = grid[y - 1][x];
          grid[y - 1][x] = 0;
          moved = true;
        }
      }
    }
  }
}

// Beräknar fallhastighet baserat på nivå
export function tickSpeed(level: number): number {
  // Modern Tetris fallhastighet: snabbare på högre nivåer
  return Math.max(50, 800 - level * 50);
}

// Beräknar poäng baserat på antal rader och nivå
export function calculateScore(lines: number, level: number): number {
  const lineScores = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 rader
  return lineScores[lines] * level;
}

// Beräknar poäng med Back-to-Back bonus
export function calculateScoreWithB2B(lines: number, level: number, isBackToBack: boolean = false): number {
  const baseScore = calculateScore(lines, level);
  
  // Back-to-Back bonus för Tetris (4 rader)
  if (lines === 4 && isBackToBack) {
    return Math.floor(baseScore * 1.5); // 50% bonus för B2B Tetris
  }
  
  return baseScore;
}

// Beräknar combo-poäng
export function calculateComboScore(combo: number, level: number): number {
  if (combo <= 1) return 0;
  return combo * 50 * level; // 50 poäng per combo-nivå * level
}

// Beräknar soft drop poäng
export function calculateSoftDropScore(distance: number, level: number): number {
  return distance * level; // 1 poäng per rad * level
}

// Beräknar hard drop poäng
export function calculateHardDropScore(distance: number, level: number): number {
  return distance * 2; // 2 poäng per rad (fast)
}

// Kontrollerar om en line clear är en Tetris (4 rader)
export function isTetris(lines: number): boolean {
  return lines === 4;
}

// Förbättrad T-Spin detection
export function isTSpin(lines: number, pieceId: number, lastMove: string, board: Grid, piece: Piece): boolean {
  // Endast T-pjäser kan göra T-Spin
  if (pieceId !== 6) return false;
  
  // Måste ha gjort en rotation som sista rörelse
  if (lastMove !== 'rotate') return false;
  
  // Kontrollera om pjäsen är i en T-Spin position
  // Detta är en förenklad version - full T-Spin detection är mer komplex
  const corners = getPieceCorners(piece, board);
  const filledCorners = corners.filter(corner => 
    corner.x >= 0 && corner.x < W && 
    corner.y >= 0 && corner.y < H && 
    board[corner.y][corner.x] !== 0
  ).length;
  
  // T-Spin Mini: 2-3 hörn fyllda
  // T-Spin: 3 hörn fyllda
  return filledCorners >= 2 && lines > 0;
}

// Hjälpfunktion för att få hörnen av en pjäs
function getPieceCorners(piece: Piece, board: Grid): {x: number, y: number}[] {
  const shape = SHAPES[piece.id][piece.r];
  const corners: {x: number, y: number}[] = [];
  
  // Hitta hörnen av pjäsen
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        
        // Kontrollera om detta är ett hörn (har minst en tom cell bredvid)
        const isCorner = (
          (boardX > 0 && boardY > 0 && board[boardY-1][boardX-1] === 0) ||
          (boardX < W-1 && boardY > 0 && board[boardY-1][boardX+1] === 0) ||
          (boardX > 0 && boardY < H-1 && board[boardY+1][boardX-1] === 0) ||
          (boardX < W-1 && boardY < H-1 && board[boardY+1][boardX+1] === 0)
        );
        
        if (isCorner) {
          corners.push({x: boardX, y: boardY});
        }
      }
    }
  }
  
  return corners;
}

// Beräknar total poäng för en line clear med alla bonusar
export function calculateTotalScore(
  lines: number, 
  level: number, 
  isBackToBack: boolean = false, 
  isTSpin: boolean = false,
  combo: number = 0
): number {
  let score = calculateScoreWithB2B(lines, level, isBackToBack);
  
  // T-Spin bonus
  if (isTSpin) {
    if (lines === 0) {
      score = 400 * level; // T-Spin Mini utan line clear
    } else {
      score = Math.floor(score * 1.5); // 50% bonus för T-Spin med line clear
    }
  }
  
  // Combo bonus
  score += calculateComboScore(combo, level);
  
  return score;
}

// Kontrollerar om spelet är över (när nya pjäser krockar direkt)
export function isGameOver(grid: Grid): boolean {
  // Kontrollera om det finns block i de övre raderna
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Hjälpfunktion för att räkna antal tomma celler i en rad
export function countEmptyCells(row: Cell[]): number {
  return row.filter(cell => cell === 0).length;
}

// Hjälpfunktion för att hitta den högsta raden med block
export function getHighestRow(grid: Grid): number {
  for (let y = 0; y < H; y++) {
    if (grid[y].some(cell => cell !== 0)) {
      return y;
    }
  }
  return H;
} 

// Roterar ett block
export function rotate(p: Piece, dir: 1 | -1): Piece {
  const cp = clone(p);
  cp.r = (cp.r + (dir === 1 ? 1 : -1) + 4) % 4;
  return cp;
}

// SRS (Super Rotation System) Wall Kick Offsets
// Format: [fromRotation][toRotation] = [[x1, y1], [x2, y2], ...]
const SRS_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  // J, L, S, T, Z pieces (standard SRS)
  1: {
    0: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 1->0
    2: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],     // 1->2
  },
  2: {
    1: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],    // 2->1
    3: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],  // 2->3
  },
  3: {
    2: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 3->2
    0: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],     // 3->0
  },
  0: {
    3: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],    // 0->3
    1: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],  // 0->1
  },
};

// I-piece specific wall kicks (unique offsets)
const I_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  1: {
    0: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],   // 1->0
    2: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],   // 1->2
  },
  2: {
    1: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],   // 2->1
    3: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],   // 2->3
  },
  3: {
    2: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],   // 3->2
    0: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],   // 3->0
  },
  0: {
    3: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],   // 0->3
    1: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],   // 0->1
  },
};

// O-piece doesn't rotate (stays the same)
const O_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  0: { 0: [[0, 0]] }, // No rotation needed
};

// SRS Rotation med Wall Kicks
export function rotateWithSRS(p: Piece, dir: 1 | -1, grid: Grid): Piece | null {
  const fromRotation = p.r;
  const toRotation = (fromRotation + (dir === 1 ? 1 : -1) + 4) % 4;
  
  // O-piece doesn't rotate
  if (p.id === 4) {
    return p;
  }
  
  // Get appropriate wall kick table
  let wallKicks: number[][];
  if (p.id === 1) { // I-piece
    wallKicks = I_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  } else if (p.id === 4) { // O-piece
    wallKicks = O_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  } else { // J, L, S, T, Z pieces
    wallKicks = SRS_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  }
  
  // Test each wall kick offset
  for (const [dx, dy] of wallKicks) {
    const testPiece: Piece = {
      id: p.id,
      r: toRotation,
      x: p.x + dx,
      y: p.y + dy
    };
    
    if (!collide(grid, testPiece)) {
      return testPiece;
    }
  }
  
  // No valid position found
  return null;
} 

// Game State Enum för tydlig state-hantering
export enum GameState {
  START = 'START',           // Titelskärm eller "Press Start"
  PLAYING = 'PLAYING',       // Normalt spel
  PAUSE = 'PAUSE',          // Spelet fryst, väntar på återupptagning
  GAME_OVER = 'GAME_OVER'   // Slutskärm
}

// State transition validation
export const ALLOWED_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.START]: [GameState.PLAYING],
  [GameState.PLAYING]: [GameState.PAUSE, GameState.GAME_OVER, GameState.START], // Tillåt att gå till START från PLAYING
  [GameState.PAUSE]: [GameState.PLAYING, GameState.START],
  [GameState.GAME_OVER]: [GameState.START]
};

// Input permissions för varje state
export const INPUT_PERMISSIONS: Record<GameState, string[]> = {
  [GameState.START]: ['Enter', 'Space'], // Endast start-knappar
  [GameState.PLAYING]: [
    'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
    'Space', 'KeyC', 'KeyP', 'Escape', 'KeyR'
  ],
  [GameState.PAUSE]: ['KeyP', 'Escape', 'Enter'], // Endast paus/resume och meny
  [GameState.GAME_OVER]: ['Enter', 'Space', 'KeyR'] // Endast restart och meny
};

// State transition funktioner
export function canTransition(from: GameState, to: GameState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
}

export function isInputAllowed(state: GameState, key: string): boolean {
  return INPUT_PERMISSIONS[state]?.includes(key) || false;
}

// State transition med validering
export function validateStateTransition(from: GameState, to: GameState): boolean {
  if (!canTransition(from, to)) {
    console.warn(`Invalid state transition: ${from} -> ${to}`);
    return false;
  }
  return true;
}

// State transition med callback
export function transitionState(
  from: GameState, 
  to: GameState, 
  onTransition?: (from: GameState, to: GameState) => void
): GameState | null {
  if (validateStateTransition(from, to)) {
    if (onTransition) {
      onTransition(from, to);
    }
    return to;
  }
  return null;
} 

// Beräknar ghost piece position (spökskuggan som visar var pjäsen kommer landa)
export function getGhostPiecePosition(currentPiece: Piece, grid: Grid): Piece | null {
  if (!currentPiece) return null;
  
  // Kopiera nuvarande pjäs
  const ghostPiece = clone(currentPiece);
  
  // Flyttar nedåt stegvis tills kollision upptäcks
  while (!collide(grid, ghostPiece)) {
    ghostPiece.y++;
  }
  
  // Flyttar ett steg upp för sista giltiga positionen
  ghostPiece.y--;
  
  // Kontrollera att ghost piece inte är samma som current piece
  if (ghostPiece.y === currentPiece.y) {
    return null; // Ingen ghost piece behövs om pjäsen redan är på botten
  }
  
  return ghostPiece;
}

// Kontrollerar om ghost piece ska visas
export function shouldShowGhostPiece(currentPiece: Piece, ghostPiece: Piece | null, gameState: GameState): boolean {
  return gameState === GameState.PLAYING && 
         currentPiece !== null && 
         ghostPiece !== null && 
         ghostPiece.y !== currentPiece.y;
} 

// LocalStorage funktioner för lokala highscores
export interface LocalScore {
  id: number;
  playerName: string;
  score: number;
  level: number;
  lines: number;
  date: string;
}

// Spara en ny highscore till LocalStorage
export function saveLocalScore(score: Omit<LocalScore, 'id'>): void {
  try {
    const existingScores = getLocalScores();
    const newScore: LocalScore = {
      ...score,
      id: Date.now() // Använd timestamp som unikt ID
    };
    
    const updatedScores = [...existingScores, newScore]
      .sort((a, b) => b.score - a.score) // Sortera efter poäng (högst först)
      .slice(0, 10); // Behåll bara top 10
    
    localStorage.setItem('tetris-highscores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Failed to save local score:', error);
  }
}

// Hämta alla lokala highscores
export function getLocalScores(): LocalScore[] {
  try {
    const scores = localStorage.getItem('tetris-highscores');
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Failed to load local scores:', error);
    return [];
  }
}

// Kontrollera om en poäng är en highscore
export function isLocalHighscore(score: number): boolean {
  const scores = getLocalScores();
  return scores.length < 10 || score > scores[scores.length - 1].score;
}

// Rensa alla lokala highscores
export function clearLocalScores(): void {
  try {
    localStorage.removeItem('tetris-highscores');
  } catch (error) {
    console.error('Failed to clear local scores:', error);
  }
}

// Ta bort en specifik highscore
export function deleteLocalScore(id: number): void {
  try {
    const scores = getLocalScores();
    const updatedScores = scores.filter(s => s.id !== id);
    localStorage.setItem('tetris-highscores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Failed to delete local score:', error);
  }
} 

 