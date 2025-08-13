
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

// Rensar kompletta rader och returnerar antal rensade rader
export function clearLines(grid: Grid): number {
  let cleared = 0;
  for (let y = H - 1; y >= 0; y--) {
    if (grid[y].every(c => c !== 0)) {
      grid.splice(y, 1);
      grid.unshift(Array(W).fill(0) as Cell[]);
      cleared++;
      y++; // Kontrollera samma rad igen
    }
  }
  return cleared;
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