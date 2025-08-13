import React from 'react';
import GameBoard from './GameBoard';
import { emptyGrid, Grid, collide, spawn, Bag, Piece, W, H, rotateWithSRS, collideWithWalls, collideWithBottom, collideWithBlocks, canMoveLeft, canMoveRight, canMoveDown, isLanded, validateGrid } from '../tetris';

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

  // Test 9: SRS Rotation mitt i spelplan
  testSRSRotationCenter: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 3, y: 0 }; // I-piece i mitten
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated !== null && rotated.r === 1;
    console.log('Test 9 - SRS Rotation mitt i spelplan:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 10: SRS Wall kick vid vänster vägg
  testSRSWallKickLeft: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 2, r: 0, x: 0, y: 0 }; // J-piece vid vänster vägg
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated !== null && rotated.r === 1;
    console.log('Test 10 - SRS Wall kick vänster:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 11: SRS Wall kick vid höger vägg
  testSRSWallKickRight: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 2, r: 0, x: W - 3, y: 0 }; // J-piece vid höger vägg
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated !== null && rotated.r === 1;
    console.log('Test 11 - SRS Wall kick höger:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 12: SRS Wall kick ovanpå stapel
  testSRSWallKickStack: () => {
    const grid = emptyGrid();
    // Skapa en stapel av brickor
    for (let x = 0; x < W; x++) {
      grid[15][x] = 1;
    }
    const piece: Piece = { id: 2, r: 0, x: 3, y: 13 }; // J-piece ovanpå stapel
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated !== null && rotated.r === 1;
    console.log('Test 12 - SRS Wall kick ovanpå stapel:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 13: SRS Rotation blockeras när ingen giltig position finns
  testSRSRotationBlocked: () => {
    const grid = emptyGrid();
    // Skapa en tight situation där rotation inte kan ske
    grid[0][0] = 1; grid[0][1] = 1; grid[0][2] = 1;
    grid[1][0] = 1; grid[1][1] = 1; grid[1][2] = 1;
    const piece: Piece = { id: 2, r: 0, x: 0, y: 0 }; // J-piece i hörnet
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated === null; // Ska returnera null
    console.log('Test 13 - SRS Rotation blockerad:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 14: O-piece roteras inte
  testOPieceNoRotation: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 4, r: 0, x: 3, y: 0 }; // O-piece
    const rotated = rotateWithSRS(piece, 1, grid);
    const result = rotated !== null && rotated.r === 0; // Ska förbli samma rotation
    console.log('Test 14 - O-piece roteras inte:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 15: Kollision med väggar
  testWallCollision: () => {
    const piece: Piece = { id: 1, r: 0, x: -1, y: 0 }; // I-piece utanför vänster vägg
    const result = collideWithWalls(piece);
    console.log('Test 15 - Kollision med väggar:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 16: Kollision med botten
  testBottomCollision: () => {
    const piece: Piece = { id: 1, r: 0, x: 3, y: H }; // I-piece utanför botten
    const result = collideWithBottom(piece);
    console.log('Test 16 - Kollision med botten:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 17: Kollision med andra block
  testBlockCollision: () => {
    const grid = emptyGrid();
    grid[0][3] = 1; // Placera en bricka
    const piece: Piece = { id: 2, r: 0, x: 3, y: 0 }; // J-piece som krockar
    const result = collideWithBlocks(grid, piece);
    console.log('Test 17 - Kollision med andra block:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 18: Rörelse i alla riktningar
  testMovementInAllDirections: () => {
    const grid = emptyGrid();
    const piece: Piece = { id: 1, r: 0, x: 3, y: 0 }; // I-piece i mitten
    
    const canLeft = canMoveLeft(grid, piece);
    const canRight = canMoveRight(grid, piece);
    const canDown = canMoveDown(grid, piece);
    
    const result = canLeft && canRight && canDown;
    console.log('Test 18 - Rörelse i alla riktningar:', result ? 'PASS' : 'FAIL');
    return result;
  },

  // Test 19: Pjäs är landed
  testPieceIsLanded: () => {
    const grid = emptyGrid();
    // Skapa en stapel
    for (let x = 0; x < W; x++) {
      grid[15][x] = 1;
    }
    const piece: Piece = { id: 1, r: 0, x: 3, y: 14 }; // I-piece ovanpå stapel
    const result = isLanded(grid, piece);
    console.log('Test 19 - Pjäs är landed:', result ? 'PASS' : 'FAIL');
    return result === true;
  },

  // Test 20: Grid validering
  testGridValidation: () => {
    const grid = emptyGrid();
    const result = validateGrid(grid);
    console.log('Test 20 - Grid validering (tom):', result ? 'PASS' : 'FAIL');
    
    // Testa med giltiga block
    grid[0][0] = 1;
    grid[0][1] = 2;
    const result2 = validateGrid(grid);
    console.log('Test 20 - Grid validering (med block):', result2 ? 'PASS' : 'FAIL');
    
    return result && result2;
  },

  // Test 21: Inga block överlappar
  testNoBlockOverlap: () => {
    const grid = emptyGrid();
    // Placera block utan överlapp
    grid[0][0] = 1;
    grid[0][1] = 2;
    grid[1][0] = 3;
    
    const result = validateGrid(grid);
    console.log('Test 21 - Inga block överlappar:', result ? 'PASS' : 'FAIL');
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
      MovementTestSuite.testAllTetrominoTypes,
      MovementTestSuite.testSRSRotationCenter,
      MovementTestSuite.testSRSWallKickLeft,
      MovementTestSuite.testSRSWallKickRight,
      MovementTestSuite.testSRSWallKickStack,
      MovementTestSuite.testSRSRotationBlocked,
      MovementTestSuite.testOPieceNoRotation,
      MovementTestSuite.testWallCollision,
      MovementTestSuite.testBottomCollision,
      MovementTestSuite.testBlockCollision,
      MovementTestSuite.testMovementInAllDirections,
      MovementTestSuite.testPieceIsLanded,
      MovementTestSuite.testGridValidation,
      MovementTestSuite.testNoBlockOverlap
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
    
         SRS Rotation tester:
     8. Rotation mitt i spelplan - ska fungera normalt
     9. Rotation vid vänster vägg - ska använda wall kick
     10. Rotation vid höger vägg - ska använda wall kick
     11. Rotation ovanpå stapel - ska använda wall kick
     12. Rotation i tighta utrymmen - ska blockeras
     13. O-piece rotation - ska inte rotera (förblir samma)
     
     Lock Delay tester:
     14. Pjäs låser sig efter 500ms när den landar
     15. Lock delay återställs när pjäsen rör sig
     16. Lock delay återställs vid rotation
     17. Pjäs låser sig omedelbart vid hard drop
     18. Inga block överlappar varandra
     19. Kollisionsdetektering fungerar i alla riktningar
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
    
         SRS Rotation kontroller:
     8. Rotationer känns responsiva och naturliga
     9. Wall kicks fungerar smidigt vid väggar
     10. Rotationer följer Tetris Guideline-standarder
     11. O-piece förblir oförändrad vid rotation
     12. I-piece har unika rotationer (längre offsets)
     
     Lock Delay kontroller:
     13. Pjäser låser sig naturligt efter kort fördröjning
     14. Lock delay återställs smidigt vid rörelse/rotation
     15. Inga block glitchar eller överlappar
     16. Kollisionsdetektering känns responsiv och korrekt
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
