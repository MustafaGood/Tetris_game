import React from 'react';
import GameBoard from './GameBoard';
import { emptyGrid, Grid, collide, spawn, Bag, Piece, W, H } from '../tetris';

// Manual test documentation för rörelselogik
// Dessa tester ska köras manuellt i webbläsaren

export const MovementTestSuite = {
  // Test 1: Vänster vid vägg
  testLeftWallCollision: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 0, y: 0 }; // I-piece vid vänster vägg
    const result = collide(grid, piece);
    console.log('Test 1 - Vänster vid vägg:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 2: Höger vid vägg
  testRightWallCollision: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: W - 4, y: 0 }; // I-piece vid höger vägg
    const result = collide(grid, piece);
    console.log('Test 2 - Höger vid vägg:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 3: Höger in i bricka
  testRightIntoBlock: () => {
    const grid = emptyGrid();
    grid[0][5] = 1; // Placera en bricka
    const piece: Piece = { id: 2, r: 0, x: 3, y: 0 }; // J-piece som krockar
    const result = collide(grid, piece);
    console.log('Test 3 - Höger in i bricka:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 4: Giltig position
  testValidPosition: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 3, y: 0 }; // I-piece i mitten
    const result = collide(grid, piece);
    console.log('Test 4 - Giltig position:', !result ? 'PASS' : 'FAIL');
    return result === false;
  },

  // Test 5: Soft drop ökar y med 1
  testSoftDropMovement: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 3, y: 0 };
    const movedPiece = { ...piece, y: piece.y + 1 };
    const result = collide(grid, movedPiece);
    console.log('Test 5 - Soft drop rörelse:', !result ? 'PASS' : 'FAIL');
    return result === false;
  },

  // Test 6: Hard drop landar korrekt
  testHardDropLanding: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 3, y: 0 };
    let currentPiece = { ...piece };
    let dropDistance = 0;
    
    while (!collide(grid, { ...currentPiece, y: currentPiece.y + 1 })) {
      currentPiece.y++;
      dropDistance++;
    }
    
    const expectedDistance = H - 1;
    const result = dropDistance === expectedDistance;
    console.log('Test 6 - Hard drop landar korrekt:', result ? 'PASS' : 'FAIL');
    console.log(`  Drop distance: ${dropDistance}, Expected: ${expectedDistance}`);
    return result;
  },

  // Test 7: Spawn position
  testSpawnPosition: () => {
    const bag = new Bag();
    const piece = spawn(bag);
    const expectedX = Math.floor(W/2) - 2;
    const result = piece.x === expectedX && piece.y === 0 && piece.r === 0;
    console.log('Test 7 - Spawn position:', result ? 'PASS' : 'FAIL');
    console.log(`  Position: x=${piece.x}, y=${piece.y}, r=${piece.r}`);
    return result;
  },

  // Test 8: Alla tetromino-typer
  testAllTetrominoTypes: () => {
    const bag = new Bag();
    const spawnedTypes = new Set<number>();
    
    for (let i = 0; i < 50; i++) {
      const piece = spawn(bag);
      spawnedTypes.add(piece.id);
    }
    
    const result = spawnedTypes.size === 7;
    console.log('Test 8 - Alla tetromino-typer:', result ? 'PASS' : 'FAIL');
    console.log(`  Found types: ${Array.from(spawnedTypes).sort().join(', ')}`);
    return result;
  },

  // Kör alla tester
  runAllTests: () => {
    console.log('🚀 Körning av Movement Logic Tests...');
    console.log('=====================================');
    
    const tests = [
      MovementTestSuite.testLeftWallCollision,
      MovementTestSuite.testRightWallCollision,
      MovementTestSuite.testRightIntoBlock,
      MovementTestSuite.testValidPosition,
      MovementTestSuite.testSoftDropMovement,
      MovementTestSuite.testHardDropLanding,
      MovementTestSuite.testSpawnPosition,
      MovementTestSuite.testAllTetrominoTypes
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach((test, index) => {
      try {
        const result = test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`Test ${index + 1} - ERROR:`, error);
        failed++;
      }
    });
    
    console.log('=====================================');
    console.log(`📊 Resultat: ${passed} PASS, ${failed} FAIL`);
    console.log(`✅ Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    return { passed, failed };
  }
};

// Manual test instructions
export const ManualTestInstructions = {
  title: '🧪 Manual Testing Instructions',
  
  keyboardControls: `
    Kontrollera att följande tangentbordskontroller fungerar:
    
    ← Vänster: Pjäs flyttas vänster (blockeras vid vägg/bricka)
    → Höger: Pjäs flyttas höger (blockeras vid vägg/bricka)
    ↓ Nedåt: Soft drop (pjäs faller snabbare)
    Space: Hard drop (pjäs faller direkt ner)
    ↑ Uppåt: Rotera pjäs
    C: Hold pjäs
    P/Esc: Pausa/Fortsätt
    R: Starta om
  `,
  
  edgeCases: `
    Testa kantfall:
    
    1. Pjäs vid vänster vägg - ska inte kunna gå vänster
    2. Pjäs vid höger vägg - ska inte kunna gå höger
    3. Pjäs bredvid vägg - ska kunna röra sig åt andra hållet
    4. Pjäs ovan brickor - ska kunna röra sig vänster/höger
    5. Pjäs vid botten - ska låsas på plats
    6. Snabb tangenttryckning - ska inte orsaka problem
    7. Hållen tangent - ska ha throttling
  `,
  
  visualChecks: `
    Visuella kontroller:
    
    1. Pjäser renderas korrekt med rätt färger
    2. Rörelse är smidig utan lagg
    3. Kollisioner visas tydligt
    4. Next pieces visas korrekt
    5. Hold-funktion fungerar visuellt
    6. Poäng uppdateras vid hard drop
    7. Game over visas korrekt
  `,
  
  runTests: () => {
    console.log(ManualTestInstructions.title);
    console.log(ManualTestInstructions.keyboardControls);
    console.log(ManualTestInstructions.edgeCases);
    console.log(ManualTestInstructions.visualChecks);
    
    // Kör automatiska tester
    MovementTestSuite.runAllTests();
  }
};

// Exportera för användning i utvecklingsläge
if (typeof window !== 'undefined') {
  (window as any).TetrisTests = {
    MovementTestSuite,
    ManualTestInstructions
  };
  
  console.log('🧪 Tetris test suite loaded!');
  console.log('Kör window.TetrisTests.MovementTestSuite.runAllTests() för automatiska tester');
  console.log('Kör window.TetrisTests.ManualTestInstructions.runTests() för manual tester');
}
