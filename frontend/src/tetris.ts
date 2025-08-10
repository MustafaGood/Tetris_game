
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

// Roterar ett block
export function rotate(p: Piece, dir: 1 | -1): Piece {
  const cp = clone(p);
  cp.r = (cp.r + (dir === 1 ? 1 : -1) + 4) % 4;
  return cp;
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