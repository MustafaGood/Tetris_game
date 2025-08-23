// ========================================
// TETRIS SPEL - HUVUDLOGIK
// ========================================
// Denna fil innehåller all spelogik för Tetris-spelet
// Inkluderar: tetrominoer, kollisionsdetektering, poängberäkning och spelstatus

// Typdefinitioner för spelceller och rutnät
export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Grid = Cell[][];

// Spelbrädets dimensioner (bredd x höjd)
export const W = 10, H = 20;

// Färger för olika tetrominoer (1-7 representerar olika former)
export const TETROMINO_COLORS = {
  1: '#00f5ff',  // Cyan (I-form)
  2: '#0000ff',  // Blå (J-form) 
  3: '#ff7f00',  // Orange (L-form)
  4: '#ffff00',  // Gul (O-form)
  5: '#00ff00',  // Grön (S-form)
  6: '#8000ff',  // Lila (T-form)
  7: '#ff0000',  // Röd (Z-form)
};

// Definitioner av alla tetromino-former och deras rotationer
// Varje form har 4 rotationer (0, 90, 180, 270 grader)
const SHAPES: Record<number, number[][][]> = {
  1: [  // I-form (lång rak)
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],  // Liggande
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],  // Stående
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],  // Liggande (omvänd)
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],  // Stående (omvänd)
  ],
  2: [  // J-form (L-formad)
    [[2,0,0],[2,2,2],[0,0,0]],  // L-formad uppåt
    [[0,2,2],[0,2,0],[0,2,0]],  // L-formad höger
    [[0,0,0],[2,2,2],[0,0,2]],  // L-formad nedåt
    [[0,2,0],[0,2,0],[2,2,0]],  // L-formad vänster
  ],
  3: [  // L-form (omvänd L-formad)
    [[0,0,3],[3,3,3],[0,0,0]],  // L-formad uppåt
    [[0,3,0],[0,3,0],[0,3,3]],  // L-formad höger
    [[0,0,0],[3,3,3],[3,0,0]],  // L-formad nedåt
    [[3,3,0],[0,3,0],[0,3,0]],  // L-formad vänster
  ],
  4: [  // O-form (kvadratisk)
    [[4,4],[4,4]],  // Kvadrat (ingen rotation behövs)
  ],
  5: [  // S-form (S-formad)
    [[0,5,5],[5,5,0],[0,0,0]],  // S-formad
    [[0,5,0],[0,5,5],[0,0,5]],  // S-formad roterad
    [[0,0,0],[0,5,5],[5,5,0]],  // S-formad omvänd
    [[5,0,0],[5,5,0],[0,5,0]],  // S-formad roterad omvänd
  ],
  6: [  // T-form (T-formad)
    [[0,6,0],[6,6,6],[0,0,0]],  // T-formad uppåt
    [[0,6,0],[0,6,6],[0,6,0]],  // T-formad höger
    [[0,0,0],[6,6,6],[0,6,0]],  // T-formad nedåt
    [[0,6,0],[6,6,0],[0,6,0]],  // T-formad vänster
  ],
  7: [  // Z-form (Z-formad)
    [[7,7,0],[0,7,7],[0,0,0]],  // Z-formad
    [[0,0,7],[0,7,7],[0,7,0]],  // Z-formad roterad
    [[0,0,0],[7,7,0],[0,7,7]],  // Z-formad omvänd
    [[0,7,0],[7,7,0],[7,0,0]],  // Z-formad roterad omvänd
  ],
};

// Typdefinition för en spelbit (tetromino)
export type Piece = { id: number; r: number; x: number; y: number };

// Skapar ett tomt spelbräde fyllt med nollor
export function emptyGrid(): Grid {
  return Array.from({ length: H }, () => Array(W).fill(0) as Cell[]);
}

// Klass för att hantera slumpmässig generering av spelbitar
// Använder "7-bag" system för att förhindra att samma bit kommer för ofta
export class Bag {
  private bag: number[] = [];           // Aktuell påse med bitar
  private history: number[] = [];      // Historik över senaste bitarna

  // Hämtar nästa spelbit från påsen
  next(): number {
    if (this.bag.length === 0) {
      // Om påsen är tom, skapa en ny med alla 7 bitar i slumpmässig ordning
      this.bag = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5);
    }
    const piece = this.bag.pop()!;
    this.history.push(piece);
    
    // Behåll bara de senaste 14 bitarna i historiken
    if (this.history.length > 14) {
      this.history.shift();
    }
    
    return piece;
  }

  // Kontrollerar om en viss bit har kommit nyligen
  hasInHistory(pieceId: number): boolean {
    return this.history.includes(pieceId);
  }

  // Återställer påsen och historiken
  reset(): void {
    this.bag = [];
    this.history = [];
  }
}

// Skapar en ny spelbit på toppen av spelbrädet
export function spawn(bag: Bag): Piece {
  const id = bag.next();                    // Hämtar nästa bit från påsen
  const r = 0;                              // Startar med rotation 0
  const x = Math.floor(W/2) - 2;           // Centrerar biten horisontellt
  const y = 0;                              // Placerar biten på toppen
  return { id, r, x, y };
}

// Hjälpfunktion för att kopiera värden (deep copy)
export function clone<T>(v: T): T { 
  return JSON.parse(JSON.stringify(v)); 
}

// Hämtar formen för en spelbit baserat på dess ID och rotation
export function shape(p: Piece): number[][] { 
  return SHAPES[p.id][p.r % SHAPES[p.id].length]; 
}

// ========================================
// KOLLISIONSDETEKTERING
// ========================================
// Funktioner för att kontrollera om spelbitar kolliderar med varandra eller väggar

// Kontrollerar om en spelbit kolliderar med något på spelbrädet
export function collide(grid: Grid, p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;  // Hoppa över tomma celler
      const x = p.x + dx, y = p.y + dy;
      if (x < 0 || x >= W || y >= H) return true;  // Kollision med väggar eller golv
      if (y >= 0 && grid[y][x]) return true;       // Kollision med andra bitar
    }
  }
  return false;
}

// Kontrollerar om en spelbit kolliderar med sidoväggarna
export function collideWithWalls(p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;  // Hoppa över tomma celler
      const x = p.x + dx;
      if (x < 0 || x >= W) return true;  // Kollision med vänster eller höger vägg
    }
  }
  return false;
}

// Kontrollerar om en spelbit kolliderar med golvet
export function collideWithBottom(p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;  // Hoppa över tomma celler
      const y = p.y + dy;
      if (y >= H) return true;   // Kollision med golvet
    }
  }
  return false;
}

// Kontrollerar om en spelbit kolliderar med andra bitar på spelbrädet
export function collideWithBlocks(grid: Grid, p: Piece): boolean {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (!s[dy][dx]) continue;  // Hoppa över tomma celler
      const x = p.x + dx, y = p.y + dy;
      if (y >= 0 && y < H && x >= 0 && x < W && grid[y][x]) return true;
    }
  }
  return false;
}

// ========================================
// RÖRELSER
// ========================================
// Funktioner för att kontrollera om spelbitar kan röra sig i olika riktningar

// Kontrollerar om en spelbit kan röra sig åt vänster
export function canMoveLeft(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, x: p.x - 1 };
  return !collide(grid, testPiece);
}

// Kontrollerar om en spelbit kan röra sig åt höger
export function canMoveRight(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, x: p.x + 1 };
  return !collide(grid, testPiece);
}

// Kontrollerar om en spelbit kan röra sig nedåt
export function canMoveDown(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, y: p.y + 1 };
  return !collide(grid, testPiece);
}

// ========================================
// SPELBITSHANTERING
// ========================================

// Kontrollerar om en spelbit har landat (kan inte röra sig nedåt)
export function isLanded(grid: Grid, p: Piece): boolean {
  const testPiece = { ...p, y: p.y + 1 };
  return collide(grid, testPiece);
}

// Validerar att spelbrädet bara innehåller giltiga värden (0-7)
export function validateGrid(grid: Grid): boolean {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = grid[y][x];
      if (cell !== 0 && (cell < 1 || cell > 7)) {
        return false;
      }
    }
  }
  return true;
}

// ========================================
// RUTNÄTSHANTERING
// ========================================

// Lägger till en spelbit på spelbrädet (när den landar)
export function merge(grid: Grid, p: Piece): void {
  const s = shape(p);
  for (let dy = 0; dy < s.length; dy++) {
    for (let dx = 0; dx < s[dy].length; dx++) {
      if (s[dy][dx]) {
        const x = p.x + dx, y = p.y + dy;
        if (y >= 0 && y < H && x >= 0 && x < W) {
          grid[y][x] = p.id as Cell;  // Sätt bitens ID på den positionen
        }
      }
    }
  }
}

// Hittar alla rader som är fulla (alla celler är ifyllda)
export function getFullRows(grid: Grid): number[] {
  const fullRows: number[] = [];
  for (let y = 0; y < H; y++) {
    if (grid[y].every(c => c !== 0)) {  // Om alla celler i raden är ifyllda
      fullRows.push(y);
    }
  }
  return fullRows;
}

// Rensar fulla rader från spelbrädet och lägger till nya tomma rader på toppen
export function clearRows(grid: Grid, rows: number[]): void {
  if (rows.length === 0) return;
  
  // Sortera raderna från botten till toppen för att undvika indexproblem
  const sortedRows = [...rows].sort((a, b) => b - a);
  
  // Ta bort alla fulla rader
  for (const rowIndex of sortedRows) {
    grid.splice(rowIndex, 1);
  }
  
  // Lägg till nya tomma rader på toppen
  for (let i = 0; i < rows.length; i++) {
    grid.unshift(Array(W).fill(0) as Cell[]);
  }
}

// Rensar alla fulla rader och returnerar antalet rader som rensades
export function clearLines(grid: Grid): number {
  const fullRows = getFullRows(grid);
  clearRows(grid, fullRows);
  return fullRows.length;
}

// ========================================
// GRAVITATION
// ========================================
// Funktioner för att hantera hur bitar faller när rader rensas

// Kontrollerar om det finns bitar som behöver falla (tomma celler under ifyllda)
export function needsGravity(grid: Grid): boolean {
  for (let y = H - 1; y > 0; y--) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] === 0 && grid[y - 1][x] !== 0) {
        return true;  // Det finns en tom cell under en ifylld cell
      }
    }
  }
  return false;
}

// Applicerar gravitation - låter alla bitar falla tills de landar
export function applyGravity(grid: Grid): void {
  let moved = true;
  while (moved) {
    moved = false;
    for (let y = H - 1; y > 0; y--) {
      for (let x = 0; x < W; x++) {
        if (grid[y][x] === 0 && grid[y - 1][x] !== 0) {
          grid[y][x] = grid[y - 1][x];      // Flytta biten nedåt
          grid[y - 1][x] = 0;               // Rensa den gamla positionen
          moved = true;                      // Markera att något flyttades
        }
      }
    }
  }
}

// ========================================
// SPELMECHANIKER
// ========================================

// Beräknar hur snabbt spelet ska gå baserat på nivå
// Högre nivå = snabbare fallande bitar
export function tickSpeed(level: number): number {
  // Minsta hastighet är 50ms, max är 800ms
  return Math.max(50, 800 - level * 50);
}

// ========================================
// POÄNGBERÄKNING
// ========================================
// Funktioner för att beräkna poäng baserat på olika prestationer

// Grundläggande poängberäkning baserat på antal rader och nivå
export function calculateScore(lines: number, level: number): number {
  const lineScores = [0, 40, 100, 300, 1200];  // Poäng för 0, 1, 2, 3, 4 rader
  return lineScores[lines] * level;
}

// Poängberäkning med "Back-to-Back" bonus för Tetris (4 rader)
// Ger 1.5x poäng om man gör flera Tetris i rad
export function calculateScoreWithB2B(lines: number, level: number, isBackToBack: boolean = false): number {
  const baseScore = calculateScore(lines, level);
  
  // Back-to-Back bonus för Tetris
  if (lines === 4 && isBackToBack) {
    return Math.floor(baseScore * 1.5);
  }
  
  return baseScore;
}

// Bonuspoäng för kombos (flera rader i rad)
export function calculateComboScore(combo: number, level: number): number {
  if (combo <= 1) return 0;  // Ingen bonus för första raden
  return combo * 50 * level;  // 50 poäng per combo multiplicerat med nivå
}

// Poäng för "soft drop" (snabbare nedåt-rörelse)
export function calculateSoftDropScore(distance: number, level: number): number {
  return distance * level;  // 1 poäng per cell multiplicerat med nivå
}

// Poäng för "hard drop" (direkt till golvet)
export function calculateHardDropScore(distance: number): number {
  return distance * 2;  // 2 poäng per cell (fast nivå påverkar inte)
}

// ========================================
// TETRIS-SPECIFIKA
// ========================================

// Kontrollerar om en spelbit har landat i en Tetris (4 rader)
export function isTetris(lines: number): boolean {
  return lines === 4;
}

// Kontrollerar om en spelbit har landat i en T-Spin (minst 2 hörn ifyllda)
export function isTSpin(lines: number, pieceId: number, lastMove: string, board: Grid, piece: Piece): boolean {

  if (pieceId !== 6) return false;  // Endast T-form kan göra T-Spin
  
  if (lastMove !== 'rotate') return false;  // Måste ha roterats senast
  
  // Kontrollera hörnen runt T-biten
  const corners = getPieceCorners(piece, board);
  const filledCorners = corners.filter(corner => 
    corner.x >= 0 && corner.x < W && 
    corner.y >= 0 && corner.y < H && 
    board[corner.y][corner.x] !== 0
  ).length;
  
  // T-Spin kräver minst 2 hörn ifyllda och att minst 1 rad rensas
  return filledCorners >= 2 && lines > 0;
}

// Hjälpfunktion för att hitta hörnen runt en T-bit
function getPieceCorners(piece: Piece, board: Grid): {x: number, y: number}[] {
  const shape = SHAPES[piece.id][piece.r];
  const corners: {x: number, y: number}[] = [];
  
  // Gå igenom alla celler i biten
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        
        // Kontrollera om detta är ett hörn (tomma celler diagonala)
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

// Beräknar total poäng med alla bonusar (Back-to-Back, T-Spin, Combo)
export function calculateTotalScore(
  lines: number, 
  level: number, 
  isBackToBack: boolean = false, 
  isTSpin: boolean = false,
  combo: number = 0
): number {
  let score = calculateScoreWithB2B(lines, level, isBackToBack);
  
  // T-Spin bonus (1.5x poäng eller 400 poäng per nivå om ingen rad rensas)
  if (isTSpin) {
    if (lines === 0) {
      score = 400 * level;  // T-Spin utan rader
    } else {
      score = Math.floor(score * 1.5);  // T-Spin med rader
    }
  }
  
  // Lägg till combo-poäng
  score += calculateComboScore(combo, level);
  
  return score;
}

// ========================================
// SPELSTATUS
// ========================================

// Kontrollerar om spelet är över (bitar når toppen)
export function isGameOver(grid: Grid): boolean {
  // Kontrollera de två översta raderna
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] !== 0) {
        return true;  // Det finns bitar i de översta raderna
      }
    }
  }
  return false;
}

// ========================================
// HJÄLPFUNKTIONER
// ========================================

// Räknar tomma celler i en rad
export function countEmptyCells(row: Cell[]): number {
  return row.filter(cell => cell === 0).length;
}

// Hittar den högsta raden som innehåller bitar
export function getHighestRow(grid: Grid): number {
  for (let y = 0; y < H; y++) {
    if (grid[y].some(cell => cell !== 0)) {
      return y;  // Returnera första raden med bitar
    }
  }
  return H;  // Om inga bitar finns, returnera botten
} 

// ========================================
// ROTATION
// ========================================

// Roterar en spelbit i angiven riktning (1 = medurs, -1 = moturs)
export function rotate(p: Piece, dir: 1 | -1): Piece {
  const cp = clone(p);
  cp.r = (cp.r + (dir === 1 ? 1 : -1) + 4) % 4;  // Håll rotationen mellan 0-3
  return cp;
}

// ========================================
// SRS (SUPER ROTATION SYSTEM)
// ========================================
// Avancerat rotationssystem som låter bitar "sparkas" mot väggar

// Wall-kick tabeller för vanliga bitar (J, L, S, T, Z)
const SRS_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  // Från rotation 1 till 0 (medurs)
  1: {
    0: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    2: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  },
  // Från rotation 2 till 1 (medurs)
  2: {
    1: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    3: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  },
  // Från rotation 3 till 2 (medurs)
  3: {
    2: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    0: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  },
  // Från rotation 0 till 3 (medurs)
  0: {
    3: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    1: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  },
};

// Wall-kick tabeller för I-biten (har egna regler)
const I_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  1: {
    0: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    2: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  },
  2: {
    1: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    3: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  },
  3: {
    2: [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    0: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  },
  0: {
    3: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    1: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  },
};

// Wall-kick tabeller för O-biten (kvadrat - ingen rotation behövs)
const O_WALL_KICKS: Record<number, Record<number, number[][]>> = {
  0: { 0: [[0, 0]] },  // Ingen rotation möjlig
};

// Roterar en spelbit med SRS-systemet
export function rotateWithSRS(p: Piece, dir: 1 | -1, grid: Grid): Piece | null {
  const fromRotation = p.r;
  const toRotation = (fromRotation + (dir === 1 ? 1 : -1) + 4) % 4;
  
  // O-biten kan inte roteras
  if (p.id === 4) {
    return p;
  }
  
  // Välj rätt wall-kick tabell baserat på bitens typ
  let wallKicks: number[][];
  if (p.id === 1) {
    wallKicks = I_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  } else if (p.id === 4) {
    wallKicks = O_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  } else {
    wallKicks = SRS_WALL_KICKS[fromRotation][toRotation] || [[0, 0]];
  }
  
  // Testa alla wall-kick positioner tills en fungerar
  for (const [dx, dy] of wallKicks) {
    const testPiece: Piece = {
      id: p.id,
      r: toRotation,
      x: p.x + dx,
      y: p.y + dy
    };
    
    if (!collide(grid, testPiece)) {
      return testPiece;  // Returnera första position som fungerar
    }
  }
  
  // Ingen rotation möjlig
  return null;
} 

// ========================================
// SPELSTATUS HANTERING
// ========================================
// Funktioner för att hantera olika spelstatus och övergångar mellan dem

// Enumeration av alla möjliga spelstatus
export enum GameState {
  START = 'START',           // Startmeny
  PLAYING = 'PLAYING',       // Spelet pågår
  PAUSE = 'PAUSE',           // Spelet pausat
  GAME_OVER = 'GAME_OVER'    // Spelet slut
}

// Definierar vilka övergångar som är tillåtna mellan olika status
export const ALLOWED_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.START]: [GameState.PLAYING],                    // Start → Spela
  [GameState.PLAYING]: [GameState.PAUSE, GameState.GAME_OVER, GameState.START],  // Spela → Paus/Game Over/Start
  [GameState.PAUSE]: [GameState.PLAYING, GameState.START],   // Paus → Spela/Start
  [GameState.GAME_OVER]: [GameState.START, GameState.PLAYING] // Game Over → Start/Spela
};

// Definierar vilka input som är tillåtna i varje spelstatus
export const INPUT_PERMISSIONS: Record<GameState, string[]> = {
  [GameState.START]: ['Enter', 'Space'],                     // Starta spelet
  [GameState.PLAYING]: [                                      // Alla spelkontroller
    'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
    'Space', 'KeyC', 'KeyP', 'Escape', 'KeyR'
  ],
  [GameState.PAUSE]: ['KeyP', 'Escape', 'Enter'],            // Pausa/avsluta/återuppta
  [GameState.GAME_OVER]: ['Enter', 'Space', 'KeyR']          // Starta om/nytt spel
};

// ========================================
// VALIDERING OCH ÖVERGÅNGAR
// ========================================

// Kontrollerar om en övergång mellan två status är tillåten
export function canTransition(from: GameState, to: GameState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) || false;
}

// Kontrollerar om en viss input är tillåten i aktuell spelstatus
export function isInputAllowed(state: GameState, key: string): boolean {
  return INPUT_PERMISSIONS[state]?.includes(key) || false;
}

// Validerar en statusövergång och loggar varningar vid ogiltiga övergångar
export function validateStateTransition(from: GameState, to: GameState): boolean {
  if (!canTransition(from, to)) {
    console.warn(`Invalid state transition: ${from} -> ${to}`);
    return false;
  }
  return true;
}

// Utför en statusövergång med validering och callback
export function transitionState(
  from: GameState, 
  to: GameState, 
  onTransition?: (from: GameState, to: GameState) => void
): GameState | null {
  if (validateStateTransition(from, to)) {
    if (onTransition) {
      onTransition(from, to);  // Anropa callback-funktion
    }
    return to;  // Returnera ny status
  }
  return null;  // Returnera null om övergången inte är giltig
} 

// ========================================
// GHOST PIECE
// ========================================
// Funktioner för att visa var en spelbit kommer att landa

// Beräknar var en spelbit skulle landa om den föllde gravitationen
export function getGhostPiecePosition(currentPiece: Piece, grid: Grid): Piece | null {
  if (!currentPiece) return null;
  
  // Skapa en kopia av den aktuella biten
  const ghostPiece = clone(currentPiece);
  
  // Flytta biten nedåt tills den kolliderar med något
  while (!collide(grid, ghostPiece)) {
    ghostPiece.y++;
  }
  
  // Flytta tillbaka en steg (till sista giltiga positionen)
  ghostPiece.y--;
  
  // Om ghost piece är på samma position som original, visa inte den
  if (ghostPiece.y === currentPiece.y) {
    return null;
  }
  return ghostPiece;
}

// Bestämmer om ghost piece ska visas baserat på spelstatus och position
export function shouldShowGhostPiece(currentPiece: Piece, ghostPiece: Piece | null, gameState: GameState): boolean {
  return gameState === GameState.PLAYING && 
         currentPiece !== null && 
         ghostPiece !== null && 
         ghostPiece.y !== currentPiece.y;  // Visa bara om den är på en annan position
} 

// ========================================
// LOKALA POÄNG
// ========================================
// Funktioner för att spara och hantera poäng lokalt i webbläsaren

// Interface för lokala poäng
export interface LocalScore {
  id: number;           // Unikt ID för poängen
  playerName: string;   // Spelarens namn
  score: number;        // Poäng
  level: number;        // Nivå
  lines: number;        // Antal rader
  date: string;         // Datum när poängen gjordes
}

// Sparar en ny poäng lokalt (max 10 stora poäng)
export function saveLocalScore(score: Omit<LocalScore, 'id'>): void {
  try {
    const existingScores = getLocalScores();
    const newScore: LocalScore = {
      ...score,
      id: Date.now()  // Använd timestamp som unikt ID
    };
    
    // Lägg till ny poäng, sortera efter poäng (högst först) och behåll bara top 10
    const updatedScores = [...existingScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    localStorage.setItem('tetris-highscores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Failed to save local score:', error);
  }
}

// Hämtar alla lokala poäng från localStorage
export function getLocalScores(): LocalScore[] {
  try {
    const scores = localStorage.getItem('tetris-highscores');
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Failed to load local scores:', error);
    return [];
  }
}

// Kontrollerar om en poäng är tillräckligt hög för att vara en highscore
export function isLocalHighscore(score: number): boolean {
  const scores = getLocalScores();
  return scores.length < 10 || score > scores[scores.length - 1].score;
}

// Rensar alla lokala poäng
export function clearLocalScores(): void {
  try {
    localStorage.removeItem('tetris-highscores');
  } catch (error) {
    console.error('Failed to clear local scores:', error);
  }
}

// Tar bort en specifik poäng baserat på ID
export function deleteLocalScore(id: number): void {
  try {
    const scores = getLocalScores();
    const updatedScores = scores.filter(s => s.id !== id);
    localStorage.setItem('tetris-highscores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Failed to delete local score:', error);
  }
} 

// ========================================
// SLUT PÅ TETRIS SPEL - HUVUDLOGIK
// ======================================== 

 