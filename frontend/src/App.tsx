import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { 
  emptyGrid, 
  Grid, 
  Piece, 
  spawn, 
  Bag, 
  collide, 
  merge, 
  clearLines, 
  getFullRows,
  clearRows,
  applyGravity,
  rotate, 
  rotateWithSRS,
  tickSpeed, 
  W, 
  calculateScore,
  calculateScoreWithB2B,
  calculateComboScore,
  calculateSoftDropScore,
  calculateHardDropScore,
  isTetris,
  isTSpin,
  calculateTotalScore,
  isGameOver,
  isLanded,
  canMoveLeft,
  canMoveRight,
  canMoveDown,
  validateGrid,
  GameState,
  canTransition,
  isInputAllowed,
  transitionState,
  saveLocalScore,
  getLocalScores,
  isLocalHighscore,
  LocalScore
} from './tetris';
import { fetchScores, postScore, deleteScore, testConnection, Score, formatDate, formatScore } from './api';
import GameBoard from './components/GameBoard';
import SidePanel from './components/SidePanel';
import MainMenu from './components/MainMenu';
import AnimatedBackground from './components/AnimatedBackground';

// UI States för olika skärmar (separat från GameState)
type UIState = 'menu' | 'help' | 'info' | 'highscores';

// Custom hook för requestAnimationFrame med kontrollerad hastighet
function useGameLoop(callback: () => void, isActive: boolean, speed: number) {
  const savedCallback = useRef(callback);
  const lastTimeRef = useRef<number>(0);
  const animationIdRef = useRef<number>(0);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (!isActive) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = 0;
      }
      return;
    }
    
    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= speed) {
        savedCallback.current();
        lastTimeRef.current = currentTime;
      }
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = 0;
      }
    };
  }, [isActive, speed]);
}

// Custom hook för throttle av tangentbordskontroller
function useThrottledKeys() {
  const keyStates = useRef<Set<string>>(new Set());
  const lastKeyTime = useRef<Record<string, number>>({});
  const THROTTLE_DELAY = 50; // 50ms mellan upprepningar
  
  const isKeyPressed = useCallback((key: string) => {
    return keyStates.current.has(key);
  }, []);
  
  const shouldProcessKey = useCallback((key: string) => {
    const now = Date.now();
    const lastTime = lastKeyTime.current[key] || 0;
    
    if (now - lastTime >= THROTTLE_DELAY) {
      lastKeyTime.current[key] = now;
      return true;
    }
    return false;
  }, []);
  
  const setKeyPressed = useCallback((key: string, pressed: boolean) => {
    if (pressed) {
      keyStates.current.add(key);
    } else {
      keyStates.current.delete(key);
    }
  }, []);
  
  return { isKeyPressed, shouldProcessKey, setKeyPressed };
}

// Huvudkomponenten för spelet
export default function App() {
  // State-variabler för spelet
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [uiState, setUiState] = useState<UIState>('menu');
  const bag = useMemo(() => new Bag(), []);
  const [cur, setCur] = useState<Piece>(() => spawn(bag));
  const [hold, setHold] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [nextIds, setNextIds] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [points, setPoints] = useState(0);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [board, setBoard] = useState<Grid>(() => emptyGrid());
  const [scores, setScores] = useState<Score[]>([]);
  const [localScores, setLocalScores] = useState<LocalScore[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Lock delay system
  const [lockDelayTimer, setLockDelayTimer] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const LOCK_DELAY_MS = 500; // 500ms lock delay
  
  // Line clear system
  const [isClearingLines, setIsClearingLines] = useState(false);
  const [lastTetris, setLastTetris] = useState(false); // För Back-to-Back
  const [lineClearAnimation, setLineClearAnimation] = useState<number[]>([]);
  
  // Combo system
  const [combo, setCombo] = useState(0);
  const [lastMove, setLastMove] = useState<string>('');
  
  // Ghost piece setting
  const [ghostPieceEnabled, setGhostPieceEnabled] = useState(true);
  
  // Throttle-hook för tangentbordskontroller
  const { isKeyPressed, shouldProcessKey, setKeyPressed } = useThrottledKeys();

  // Fyller "next" med 5 block vid start
  useEffect(() => {
    setNextIds([bag.next(), bag.next(), bag.next(), bag.next(), bag.next()]);
  }, [bag]);

  // Testar backend-anslutning vid start
  useEffect(() => {
    testConnection().then(setBackendConnected).catch(() => setBackendConnected(false));
  }, []);

  // Laddar leaderboard när spelet är över
  useEffect(() => { 
    if (over) {
      if (backendConnected) {
        fetchScores(10).then(setScores).catch(() => {});
      }
      // Ladda lokala highscores
      setLocalScores(getLocalScores());
    }
  }, [over, backendConnected]);

  // Laddar highscores när man går till highscores-sidan
  useEffect(() => { 
    if (gameState === 'highscores') {
      if (backendConnected) {
        fetchScores(100).then(setScores).catch(() => {});
      }
      // Ladda lokala highscores
      setLocalScores(getLocalScores());
    }
  }, [gameState, backendConnected]);

  // Skapar ett nytt block
  const newPiece = useCallback((fromHold?: number) => {
    const id = fromHold ?? nextIds[0];
    const rest = fromHold ? nextIds : nextIds.slice(1);
    const refill = [...rest];
    while (refill.length < 5) refill.push(bag.next());
    setNextIds(refill);
    const p = { id, r: 0, x: Math.floor(W/2) - 2, y: 0 };
    setCur(p);
    setCanHold(true);
    return p;
  }, [nextIds, bag]);

  // Hård fall (hard drop)
  const hardDrop = useCallback(() => {
    if (over || paused || isClearingLines) return;
    let p = { ...cur };
    let dropDistance = 0;
    
    // Räkna hur långt pjäsen faller
    while (!collide(board, { ...p, y: p.y + 1 })) {
      p.y++;
      dropDistance++;
    }
    
    // Lägg till drop-bonus med korrekt poängberäkning
    if (dropDistance > 0) {
      const dropScore = calculateHardDropScore(dropDistance, level);
      setPoints(prev => prev + dropScore);
    }
    
    lockPiece(p);
  }, [cur, board, over, paused, isClearingLines, level]);

  // Mjuk fall (soft drop) med lock delay och poäng
  const softDrop = useCallback(() => {
    if (over || paused || isClearingLines) return;
    const p = { ...cur, y: cur.y + 1 };
    if (!collide(board, p)) {
      setCur(p);
      // Lägg till soft drop poäng
      const dropScore = calculateSoftDropScore(1, level);
      setPoints(prev => prev + dropScore);
      // Reset lock delay timer när pjäsen rör sig
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);
    } else {
      // Pjäsen kan inte falla längre - starta lock delay
      if (!isLocked && !lockDelayTimer) {
        const timer = setTimeout(() => {
          lockPiece(cur);
          setLockDelayTimer(null);
          setIsLocked(false);
        }, LOCK_DELAY_MS);
        setLockDelayTimer(timer);
        setIsLocked(true);
      }
    }
  }, [cur, board, over, paused, isClearingLines, lockDelayTimer, isLocked, level]);

  // Flytta block med lock delay reset
  const move = useCallback((dx: number) => {
    if (over || paused || isClearingLines) return;
    const p = { ...cur, x: cur.x + dx };
    if (!collide(board, p)) {
      setCur(p);
      // Reset lock delay timer när pjäsen rör sig
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);
    }
  }, [cur, board, over, paused, isClearingLines, lockDelayTimer]);

  // Rotera block med SRS (Super Rotation System) och lock delay reset
  const rotateCur = useCallback((dir: 1 | -1) => {
    if (over || paused || isClearingLines) return;
    
    // Använd SRS med wall kicks
    const rotatedPiece = rotateWithSRS(cur, dir, board);
    
    if (rotatedPiece) {
      setCur(rotatedPiece);
      setLastMove('rotate'); // Spara sista rörelse för T-spin detection
      // Reset lock delay timer när pjäsen roteras
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);
      // Här kan man lägga till ljudeffekt för rotation
      // playRotationSound();
    }
    // Om rotation misslyckas (null returneras) görs ingenting
  }, [cur, board, over, paused, isClearingLines, lockDelayTimer]);

  // Lås block på plats med förbättrad line clear
  const lockPiece = useCallback((p: Piece) => {
    // Validera att pjäsen inte överlappar med befintliga block
    if (collide(board, p)) {
      console.warn('Attempting to lock piece that collides with board');
      return;
    }
    
    const newBoard = [...board];
    merge(newBoard, p);
    
    // Validera att griden fortfarande är giltig
    if (!validateGrid(newBoard)) {
      console.error('Invalid grid state after merging piece');
      return;
    }
    
    // Upptäck fulla rader
    const fullRows = getFullRows(newBoard);
    
    if (fullRows.length > 0) {
      // Blockera input under line clear
      setIsClearingLines(true);
      
      // Starta animation
      setLineClearAnimation(fullRows);
      
      // Vänta lite för animation, sedan rensa raderna
      setTimeout(() => {
        // Rensa raderna
        clearRows(newBoard, fullRows);
        
        // T-Spin detection
        const isTSpinClear = isTSpin(fullRows.length, p.id, lastMove, board, p);
        
        // Beräkna poäng med alla bonusar
        const isTetrisClear = isTetris(fullRows.length);
        const isBackToBack = lastTetris && (isTetrisClear || isTSpinClear);
        const scoreGain = calculateTotalScore(fullRows.length, level, isBackToBack, isTSpinClear, combo);
        
        // Uppdatera combo
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        // Uppdatera state
        const newLines = lines + fullRows.length;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        setLines(newLines);
        setLevel(newLevel);
        setPoints(prev => prev + scoreGain);
        setLastTetris(isTetrisClear || isTSpinClear);
        
        // Sluta animation
        setLineClearAnimation([]);
        setIsClearingLines(false);
        
        // Uppdatera board
        setBoard([...newBoard]);
        
        // Kontrollera game over
        if (isGameOver(newBoard)) {
          setState(GameState.GAME_OVER);
          return;
        }
        
        newPiece();
      }, 300); // 300ms animation
    } else {
      // Inga rader att rensa - reset combo
      setCombo(0);
      setBoard(newBoard);
      
      // Kontrollera game over
      if (isGameOver(newBoard)) {
        setState(GameState.GAME_OVER);
        return;
      }
      
      newPiece();
    }
  }, [board, lines, level, lastTetris, combo, lastMove, newPiece]);

  // Håll-funktion
  const holdPiece = useCallback(() => {
    if (!canHold || over || paused) return;
    
    if (hold === null) {
      setHold(cur.id);
      newPiece();
    } else {
      const tempHold = hold;
      setHold(cur.id);
      newPiece(tempHold);
    }
    setCanHold(false);
  }, [hold, cur, canHold, over, paused, newPiece]);

  // Återställ spelet
  const reset = useCallback(() => {
    setBoard(emptyGrid());
    setCur(spawn(bag));
    setHold(null);
    setCanHold(true);
    setLevel(1);
    setLines(0);
    setPoints(0);
    setOver(false);
    setPaused(false);
    setIsLocked(false);
    setIsClearingLines(false);
    setLastTetris(false);
    setLineClearAnimation([]);
    setCombo(0);
    setLastMove('');
    if (lockDelayTimer) {
      clearTimeout(lockDelayTimer);
      setLockDelayTimer(null);
    }
    bag.reset();
    setNextIds([bag.next(), bag.next(), bag.next(), bag.next(), bag.next()]);
  }, [bag, lockDelayTimer]);

  // State transition funktion med validering
  const setState = useCallback((newState: GameState) => {
    const validTransition = transitionState(gameState, newState, (from, to) => {
      console.log(`State transition: ${from} -> ${to}`);
      
      // Hantera specifika state transitions
      switch (to) {
        case GameState.PLAYING:
          if (from === GameState.START) {
            reset(); // Nollställ spelet vid start
          }
          setPaused(false);
          break;
        case GameState.PAUSE:
          setPaused(true);
          // Nollställ lock delay timer vid paus
          if (lockDelayTimer) {
            clearTimeout(lockDelayTimer);
            setLockDelayTimer(null);
          }
          setIsLocked(false);
          break;
        case GameState.GAME_OVER:
          setOver(true);
          setPaused(false);
          // Spara till LocalStorage om det är en highscore
          if (isLocalHighscore(points)) {
            saveLocalScore({
              playerName: playerName || 'Anonym',
              score: points,
              level,
              lines,
              date: new Date().toISOString()
            });
          }
          // Stoppa alla timers
          if (lockDelayTimer) {
            clearTimeout(lockDelayTimer);
            setLockDelayTimer(null);
          }
          break;
        case GameState.START:
          setPaused(false);
          setOver(false);
          // Nollställ alla timers
          if (lockDelayTimer) {
            clearTimeout(lockDelayTimer);
            setLockDelayTimer(null);
          }
          break;
      }
    });
    
    if (validTransition) {
      setGameState(validTransition);
    }
  }, [gameState, reset, lockDelayTimer]);

  // Starta spel
  const startGame = useCallback(() => {
    setState(GameState.PLAYING);
  }, [setState]);

  // Pausa spel
  const pauseGame = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      setState(GameState.PAUSE);
    } else if (gameState === GameState.PAUSE) {
      setState(GameState.PLAYING);
    }
  }, [gameState, setState]);



  // Spara poäng
  const saveScore = useCallback(async (name: string) => {
    if (!backendConnected) return false;
    
    const result = await postScore({
      name: name.trim(),
      points,
      level,
      lines
    });
    
    if (result.success) {
      // Ladda uppdaterade highscores
      fetchScores(10).then(setScores).catch(() => {});
      return true;
    }
    
    return false;
  }, [points, level, lines, backendConnected]);

  // Ta bort poäng
  const handleDeleteScore = useCallback(async (id: number) => {
    if (!backendConnected) return;
    
    const result = await deleteScore(id);
    if (result.success) {
      setScores(prev => prev.filter(score => score.id !== id));
    }
  }, [backendConnected]);

  // Tangentbordskontroller med throttle och state-validering
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Kontrollera om input är tillåten i aktuellt state
      if (!isInputAllowed(gameState, e.code)) {
        return;
      }
      
      setKeyPressed(e.code, true);
      
      if (shouldProcessKey(e.code)) {
        switch (e.code) {
          case 'ArrowLeft':
            e.preventDefault();
            if (gameState === GameState.PLAYING) move(-1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (gameState === GameState.PLAYING) move(1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (gameState === GameState.PLAYING) softDrop();
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (gameState === GameState.PLAYING) rotateCur(1);
            break;
          case 'Space':
            e.preventDefault();
            if (gameState === GameState.PLAYING) {
              hardDrop();
            } else if (gameState === GameState.START || gameState === GameState.GAME_OVER) {
              startGame();
            }
            break;
          case 'KeyC':
            e.preventDefault();
            if (gameState === GameState.PLAYING) holdPiece();
            break;
          case 'KeyP':
            e.preventDefault();
            if (gameState === GameState.PLAYING || gameState === GameState.PAUSE) {
              pauseGame();
            }
            break;
          case 'Escape':
            e.preventDefault();
            if (gameState === GameState.PLAYING) {
              // Från PLAYING, gå till START (avsluta spel)
              setState(GameState.START);
              setUiState('menu');
            } else if (gameState === GameState.PAUSE) {
              pauseGame();
            }
            break;
          case 'KeyR':
            e.preventDefault();
            if (gameState === GameState.GAME_OVER) {
              startGame();
            }
            break;
          case 'Enter':
            e.preventDefault();
            if (gameState === GameState.START) {
              startGame();
            } else if (gameState === GameState.GAME_OVER) {
              startGame();
            }
            break;
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      setKeyPressed(e.code, false);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState, move, softDrop, rotateCur, hardDrop, holdPiece, pauseGame, reset, setKeyPressed, shouldProcessKey]);

  // Spelloop med requestAnimationFrame
  useGameLoop(() => {
    if (gameState === GameState.PLAYING) {
      softDrop();
    }
  }, gameState === GameState.PLAYING, tickSpeed(level));

  // Renderar olika skärmar baserat på gameState och uiState
  if (gameState === GameState.START && uiState === 'menu') {
    return (
      <>
        <AnimatedBackground />
        <MainMenu
          onStart={startGame}
          onHelp={() => setUiState('help')}
          onInfo={() => setUiState('info')}
          onHighscores={() => setUiState('highscores')}
          onExit={() => {
            if (confirm('Är du säker på att du vill avsluta spelet?')) {
              // Visa instruktioner för att stänga fönstret
              alert('För att stänga spelet:\n\n• Tryck Ctrl+W (Windows/Linux) eller Cmd+W (Mac)\n• Eller stäng fliken/fönstret manuellt\n\nTack för att du spelade Tetris! 🎮');
            }
          }}
        />
      </>
    );
  }

  if (gameState === GameState.PLAYING || gameState === GameState.PAUSE) {
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-6xl mx-auto flex gap-8 items-start justify-center">
              {/* Spelplan */}
              <div className="flex-shrink-0">
                <GameBoard grid={board} currentPiece={cur} gameState={gameState} ghostPieceEnabled={ghostPieceEnabled} />
                
                {/* Paus-overlay */}
                {gameState === GameState.PAUSE && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center">
                      <h2 className="text-2xl font-bold text-white mb-4">Pausat</h2>
                      <p className="text-gray-300 mb-4">Tryck P eller Esc för att fortsätta</p>
                                             <button 
                         onClick={() => {
                           // Först gå till START state, sedan till meny
                           setState(GameState.START);
                           setUiState('menu');
                         }}
                         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                       >
                         Avsluta
                       </button>
                    </div>
                  </div>
                )}
        </div>

              {/* Sidopanel */}
              <SidePanel 
                next={nextIds} 
                hold={hold} 
                level={level} 
                lines={lines} 
                points={points} 
                combo={combo}
                scores={scores}
                localScores={localScores}
                backendConnected={backendConnected}
                ghostPieceEnabled={ghostPieceEnabled}
                onToggleGhostPiece={() => setGhostPieceEnabled(!ghostPieceEnabled)}
                onQuit={() => {
                  setState(GameState.START);
                  setUiState('menu');
                }}
              />
            </div>
          </div>
        </>
      );
    }

    if (gameState === GameState.GAME_OVER) {
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Game Over!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Poäng:</span>
                <span className="text-white font-bold">{formatScore(points)}</span>
          </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Nivå:</span>
                <span className="text-white font-bold">{level}</span>
          </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rader:</span>
                <span className="text-white font-bold">{lines}</span>
        </div>
        </div>

            {backendConnected && !showNameInput && (
    <button
                onClick={() => setShowNameInput(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors mb-4"
              >
                Spara Poäng
    </button>
            )}

            {showNameInput && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Ditt namn..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  maxLength={16}
                  autoFocus
                />
          <button
                  onClick={async () => {
                    if (playerName.trim()) {
                      const success = await saveScore(playerName);
                      if (success) {
                        setShowNameInput(false);
                        setPlayerName('');
                      }
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-bold transition-colors mt-2"
                >
                  Spara
          </button>
        </div>
            )}

            <div className="space-y-2">
              <button
                onClick={startGame}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Spela Igen
              </button>
              <button
                onClick={() => {
                  setState(GameState.START);
                  setUiState('menu');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Huvudmeny
              </button>
            </div>
      </div>
    </div>
        </>
      );
    }

    if (uiState === 'highscores') {
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-600">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Highscores</h2>
              
              {/* Backend Highscores */}
              {backendConnected && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">🌐 Online Highscores</h3>
                  {scores.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {scores.map((score, index) => (
                        <div key={score.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 w-8">#{index + 1}</span>
                            <span className="text-white font-bold">{score.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-white font-bold">{formatScore(score.points)}</div>
                              <div className="text-gray-400 text-sm">Nivå {score.level} • {score.lines} rader</div>
                            </div>
                            <div className="text-gray-500 text-sm">{formatDate(score.createdAt)}</div>
                            <button
                              onClick={() => handleDeleteScore(score.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      Inga online highscores ännu
                    </div>
                  )}
                </div>
              )}

              {/* Local Highscores */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">💾 Lokala Highscores</h3>
                {localScores.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {localScores.map((score, index) => (
                      <div key={score.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 w-8">#{index + 1}</span>
                          <span className="text-white font-bold">{score.playerName}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-white font-bold">{formatScore(score.score)}</div>
                            <div className="text-gray-400 text-sm">Nivå {score.level} • {score.lines} rader</div>
                          </div>
                          <div className="text-gray-500 text-sm">{new Date(score.date).toLocaleDateString('sv-SE')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    Inga lokala highscores ännu
                  </div>
                )}
              </div>

          <button
            onClick={() => setUiState('menu')}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
        </>
      );
    }

    if (uiState === 'help') {
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-600">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">❓ Hjälp</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
            <div>
                  <h3 className="text-xl font-bold text-white mb-4">🎮 Spelkontroller</h3>
                  <div className="space-y-3">
                    <ControlItem keyName="← →" action="Flytta" description="Flytta pjäs vänster/höger" />
                    <ControlItem keyName="↓" action="Snabb fall" description="Låt pjäs falla snabbare" />
                    <ControlItem keyName="↑" action="Rotera" description="Rotera pjäs medurs" />
                    <ControlItem keyName="Space" action="Hård fall" description="Låt pjäs falla direkt" />
                    <ControlItem keyName="C" action="Håll" description="Spara pjäs för senare" />
                    <ControlItem keyName="P/Esc" action="Pausa" description="Pausa eller fortsätt spel" />
                    <ControlItem keyName="R" action="Starta om" description="Starta om spelet" />
            </div>
                </div>
                
            <div>
                  <h3 className="text-xl font-bold text-white mb-4">🏆 Poängsystem</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">1 rad:</span>
                      <span className="text-white">40 × nivå</span>
            </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">2 rader:</span>
                      <span className="text-white">100 × nivå</span>
          </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">3 rader:</span>
                      <span className="text-white">300 × nivå</span>
        </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">4 rader:</span>
                      <span className="text-white">1200 × nivå</span>
              </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Combo:</span>
                      <span className="text-white">50 × nivå × combo</span>
            </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">T-Spin:</span>
                      <span className="text-white">50% bonus</span>
          </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Back-to-Back:</span>
                      <span className="text-white">50% bonus</span>
        </div>
          </div>
                  
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      Ny nivå var 10:e rad. Spelet går snabbare på högre nivåer!
                      <br />
                      Combo ökar för varje rad som rensas i rad.
                      <br />
                      T-Spin och Back-to-Back ger extra poäng!
                    </p>
      </div>
                </div>
              </div>

          <button
            onClick={() => setUiState('menu')}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
        </>
      );
    }

    if (uiState === 'info') {
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-600">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">ℹ️ Om Spelet</h2>
                
                <div className="space-y-6 text-gray-300">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">🎮 Tetris 2.0</h3>
                    <p>En modern version av det klassiska Tetris-spelet byggd med React, TypeScript och Node.js.</p>
      </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">✨ Funktioner</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Klassisk Tetris-spel med alla 7 tetromino-former</li>
                      <li>Hold-funktion för att spara pjäser</li>
                      <li>Poängsystem med nivåer och rader</li>
                      <li>Highscore-lista med persistent lagring</li>
                      <li>Responsiv design med modern UI</li>
                      <li>Tangentbordskontroller för alla funktioner</li>
                      <li>Backend-anslutning med felhantering</li>
                    </ul>
      </div>

      <div>
                    <h3 className="text-xl font-bold text-white mb-2">🛠️ Teknisk Stack</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-white">Frontend</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li>React 18 med TypeScript</li>
                          <li>Vite för snabb utveckling</li>
                          <li>Tailwind CSS för styling</li>
                          <li>Custom animations</li>
                        </ul>
        </div>
      <div>
                        <h4 className="font-bold text-white">Backend</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li>Node.js med Express</li>
                          <li>SQLite för databas</li>
                          <li>CORS för säker kommunikation</li>
                          <li>Error handling och logging</li>
                        </ul>
        </div>
        </div>
      </div>

                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm">
                      <strong>Version:</strong> 2.0.0<br />
                      <strong>Licens:</strong> MIT<br />
                      <strong>Utvecklare:</strong> Tetris Team
                    </p>
        </div>
      </div>

                <button
                  onClick={() => setUiState('menu')}
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                >
                  Tillbaka
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Fallback - visa meny
    return (
      <>
        <AnimatedBackground />
        <MainMenu
          onStart={startGame}
          onHelp={() => setUiState('help')}
          onInfo={() => setUiState('info')}
          onHighscores={() => setUiState('highscores')}
          onExit={() => {
            if (confirm('Är du säker på att du vill avsluta spelet?')) {
              // Visa instruktioner för att stänga fönstret
              alert('För att stänga spelet:\n\n• Tryck Ctrl+W (Windows/Linux) eller Cmd+W (Mac)\n• Eller stäng fliken/fönstret manuellt\n\nTack för att du spelade Tetris! 🎮');
            }
          }}
        />
      </>
    );
  }

// Hjälpkomponent för kontrolllista
function ControlItem({ keyName, action, description }: { 
  keyName: string; 
  action: string; 
  description: string 
}) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="px-2 py-1 bg-gray-600 text-white text-sm rounded font-mono">
        {keyName}
      </kbd>
        <div>
        <div className="text-white font-bold">{action}</div>
        <div className="text-gray-400 text-sm">{description}</div>
              </div>
            </div>
  );
} 