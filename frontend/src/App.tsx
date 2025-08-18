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
import Settings from './components/Settings';
import Help from './components/Help';
import AnimatedBackground from './components/AnimatedBackground';
import ParticleEffect from './components/ParticleEffect';
import { useSound } from './hooks/useSound';
import { useTheme } from './contexts/ThemeContext';


type UIState = 'menu' | 'help' | 'info' | 'highscores' | 'settings';


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


function useThrottledKeys() {
  const keyStates = useRef<Set<string>>(new Set());
  const lastKeyTime = useRef<Record<string, number>>({});
  const THROTTLE_DELAY = 50;
  
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


export default function App() {

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
  

  const [lockDelayTimer, setLockDelayTimer] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const LOCK_DELAY_MS = 500;
  

  const [isClearingLines, setIsClearingLines] = useState(false);
  const [lastTetris, setLastTetris] = useState(false);
  const [lineClearAnimation, setLineClearAnimation] = useState<number[]>([]);
  

  const [combo, setCombo] = useState(0);
  const [lastMove, setLastMove] = useState<string>('');
  

  const [ghostPieceEnabled, setGhostPieceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [startLevel, setStartLevel] = useState(1);
  

  const { theme, setTheme } = useTheme();
  

  const [particleEffect, setParticleEffect] = useState<{
    isActive: boolean;
    position: { x: number; y: number };
  }>({ isActive: false, position: { x: 0, y: 0 } });
  

  const { isKeyPressed, shouldProcessKey, setKeyPressed } = useThrottledKeys();
  

  const sounds = useSound(soundEnabled);


  const initializeAudio = useCallback(async () => {
    try {
      await sounds.resumeAudioContext();
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }, [sounds]);


  useEffect(() => {
    setNextIds([bag.next(), bag.next(), bag.next(), bag.next(), bag.next()]);
  }, [bag]);


  useEffect(() => {
    testConnection().then(setBackendConnected).catch(() => setBackendConnected(false));
  }, []);


  useEffect(() => { 
    if (over) {
      if (backendConnected) {
        fetchScores(10).then(setScores).catch(() => {});
      }
      setLocalScores(getLocalScores());
    }
  }, [over, backendConnected]);


  useEffect(() => { 
    if (uiState === 'highscores') {
      if (backendConnected) {
        fetchScores(100).then(setScores).catch(() => {});
      }
      setLocalScores(getLocalScores());
    }
  }, [uiState, backendConnected]);


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


  const hardDrop = useCallback(() => {
    if (over || paused || isClearingLines) return;
    let p = { ...cur };
    let dropDistance = 0;
    

    while (!collide(board, { ...p, y: p.y + 1 })) {
      p.y++;
      dropDistance++;
    }
    

    if (dropDistance > 0) {
      const dropScore = calculateHardDropScore(dropDistance, level);
      setPoints(prev => prev + dropScore);

      sounds.playDrop();
    }
    
    lockPiece(p);
  }, [cur, board, over, paused, isClearingLines, level, sounds]);


  const softDrop = useCallback(() => {
    if (over || paused || isClearingLines) return;
    const p = { ...cur, y: cur.y + 1 };
    if (!collide(board, p)) {
      setCur(p);

      const dropScore = calculateSoftDropScore(1, level);
      setPoints(prev => prev + dropScore);
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);
    } else {
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


  const move = useCallback((dx: number) => {
    if (over || paused || isClearingLines) return;
    const p = { ...cur, x: cur.x + dx };
    if (!collide(board, p)) {
      setCur(p);
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);
    }
  }, [cur, board, over, paused, isClearingLines, lockDelayTimer]);


  const rotateCur = useCallback((dir: 1 | -1) => {
    if (over || paused || isClearingLines) return;
    

    const rotatedPiece = rotateWithSRS(cur, dir, board);
    
    if (rotatedPiece) {
      setCur(rotatedPiece);
      setLastMove('rotate');
      if (lockDelayTimer) {
        clearTimeout(lockDelayTimer);
        setLockDelayTimer(null);
      }
      setIsLocked(false);

      sounds.playRotate();
    }

  }, [cur, board, over, paused, isClearingLines, lockDelayTimer, sounds]);


  const lockPiece = useCallback((p: Piece) => {

    if (collide(board, p)) {
      console.warn('Attempting to lock piece that collides with board');
      return;
    }
    
    const newBoard = [...board];
    merge(newBoard, p);
    

    if (!validateGrid(newBoard)) {
      console.error('Invalid grid state after merging piece');
      return;
    }
    

    const fullRows = getFullRows(newBoard);
    
    if (fullRows.length > 0) {

      setIsClearingLines(true);
      

      setLineClearAnimation(fullRows);
      

      setTimeout(() => {

        clearRows(newBoard, fullRows);
        

        const isTSpinClear = isTSpin(fullRows.length, p.id, lastMove, board, p);
        

        const isTetrisClear = isTetris(fullRows.length);
        const isBackToBack = lastTetris && (isTetrisClear || isTSpinClear);
        const scoreGain = calculateTotalScore(fullRows.length, level, isBackToBack, isTSpinClear, combo);
        

        const newCombo = combo + 1;
        setCombo(newCombo);
        

        const newLines = lines + fullRows.length;
        const newLevel = Math.floor(newLines / 10) + 1;
        

        if (isTSpinClear) {
          sounds.playTSpin();
        } else if (isTetrisClear) {
          sounds.playTetris();
        } else {
          sounds.playLineClear();
        }
        

        if (newLevel > level) {
          sounds.playLevelUp();
        }
        
        setLines(newLines);
        setLevel(newLevel);
        setPoints(prev => prev + scoreGain);
        setLastTetris(isTetrisClear || isTSpinClear);
        

        setParticleEffect({
          isActive: true,
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
        });
        

        setLineClearAnimation([]);
        setIsClearingLines(false);
        

        setBoard([...newBoard]);
        

        if (isGameOver(newBoard)) {
          sounds.playGameOver();
          setState(GameState.GAME_OVER);
          return;
        }
        
        newPiece();
      }, 300);
    } else {
      setCombo(0);
      setBoard(newBoard);
      

      if (isGameOver(newBoard)) {
        sounds.playGameOver();
        setState(GameState.GAME_OVER);
        return;
      }
      
      newPiece();
    }
  }, [board, lines, level, lastTetris, combo, lastMove, newPiece, sounds]);


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


  const handleToggleMusic = useCallback(() => {
    sounds.toggleMusic();
  }, [sounds]);

  const handleToggleSoundEffects = useCallback(() => {
    sounds.toggleSoundEffects();
  }, [sounds]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  }, [setTheme]);


  const reset = useCallback(() => {
    setBoard(emptyGrid());
    setCur(spawn(bag));
    setHold(null);
    setCanHold(true);
    setLevel(startLevel);
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
  }, [bag, lockDelayTimer, startLevel]);


  const setState = useCallback((newState: GameState) => {
    const validTransition = transitionState(gameState, newState, (from, to) => {
      console.log(`State transition: ${from} -> ${to}`);
      

      switch (to) {
        case GameState.PLAYING:
          if (from === GameState.START || from === GameState.GAME_OVER) {
            reset();
          }
          setPaused(false);
          break;
        case GameState.PAUSE:
          setPaused(true);

          if (lockDelayTimer) {
            clearTimeout(lockDelayTimer);
            setLockDelayTimer(null);
          }
          setIsLocked(false);
          break;
        case GameState.GAME_OVER:
          setOver(true);
          setPaused(false);

          if (isLocalHighscore(points)) {
            saveLocalScore({
              playerName: playerName || 'Anonym',
              score: points,
              level,
              lines,
              date: new Date().toISOString()
            });
          }

          if (lockDelayTimer) {
            clearTimeout(lockDelayTimer);
            setLockDelayTimer(null);
          }
          break;
        case GameState.START:
          setPaused(false);
          setOver(false);

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


  const startGame = useCallback(async () => {

    await initializeAudio();

    if (sounds.musicEnabled) {
      sounds.playBackgroundMusic();
    }
    setState(GameState.PLAYING);
  }, [setState, initializeAudio, sounds]);


  const pauseGame = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      setState(GameState.PAUSE);
    } else if (gameState === GameState.PAUSE) {
      setState(GameState.PLAYING);
    }
  }, [gameState, setState]);




  const saveScore = useCallback(async (name: string) => {
    if (!backendConnected) return false;
    
    const result = await postScore({
      name: name.trim(),
      points,
      level,
      lines
    });
    
    if (result.success) {

      fetchScores(10).then(setScores).catch(() => {});
      return true;
    }
    
    return false;
  }, [points, level, lines, backendConnected]);


  const handleDeleteScore = useCallback(async (id: number) => {
    if (!backendConnected) return;
    
    const result = await deleteScore(id);
    if (result.success) {
      setScores(prev => prev.filter(score => score.id !== id));
    }
  }, [backendConnected]);


  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {

      if (!isInputAllowed(gameState, e.code)) {
        return;
      }
      
      setKeyPressed(e.code, true);
      initializeAudio();
      
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
  }, [gameState, move, softDrop, rotateCur, hardDrop, holdPiece, pauseGame, reset, setKeyPressed, shouldProcessKey, initializeAudio]);


  useGameLoop(() => {
    if (gameState === GameState.PLAYING) {
      softDrop();
    }
  }, gameState === GameState.PLAYING, tickSpeed(level));


  if (gameState === GameState.START && uiState === 'menu') {
    return (
      <>
        <AnimatedBackground />
        <MainMenu
          onStart={startGame}
          onHelp={async () => {
            await initializeAudio();
            setUiState('help');
          }}
          onInfo={async () => {
            await initializeAudio();
            setUiState('info');
          }}
          onHighscores={async () => {
            await initializeAudio();
            setUiState('highscores');
          }}
          onSettings={async () => {
            await initializeAudio();
            setUiState('settings');
          }}
          onExit={() => {
            if (confirm('Är du säker på att du vill avsluta spelet?')) {

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
          <div className="max-w-6xl mx-auto flex gap-8 items-start justify-center game-container">
            
            {/* Spelbräde */}
            <div className="flex-shrink-0 game-board-container relative">
              <GameBoard
                grid={board}
                currentPiece={cur}
                gameState={gameState}
                ghostPieceEnabled={ghostPieceEnabled}
              />

              <ParticleEffect
                isActive={particleEffect.isActive}
                position={particleEffect.position}
                onComplete={() =>
                  setParticleEffect({ isActive: false, position: { x: 0, y: 0 } })
                }
              />

              {gameState === GameState.PAUSE && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Pausat</h2>
                    <p className="text-gray-300 mb-4">
                      Tryck P eller Esc för att fortsätta
                    </p>
                    <button
                      onClick={async () => {
                        await initializeAudio();
                        setState(GameState.START);
                        setUiState("menu");
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Avsluta
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3x3 Infopanel */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 w-[600px] text-white">
              {/* Håll Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-green-400 mb-2">Håll</h3>
                <div className="text-center">
                  {hold !== null ? (
                    <div className="text-2xl">📦</div>
                  ) : (
                    <p className="text-gray-400">(Tomt)</p>
                  )}
                </div>
              </div>

              {/* Kommande Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-blue-400 mb-2">Kommande</h3>
                <div className="text-center">
                  <p className="text-sm text-gray-300">{nextIds.length} brickor</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {nextIds.slice(0, 3).map((id, index) => (
                      <div key={index} className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statistik Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-yellow-400 mb-2">Statistik</h3>
                <div className="space-y-1 text-sm">
                  <p>Nivå: <span className="text-white font-bold">{level}</span></p>
                  <p>Rader: <span className="text-white font-bold">{lines}</span></p>
                  <p>Poäng: <span className="text-white font-bold">{formatScore(points)}</span></p>
                  {combo > 0 && (
                    <p className="text-orange-400">Combo: {combo}</p>
                  )}
                </div>
              </div>

              {/* Inställningar Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-purple-400 mb-2">Inställningar</h3>
                <div className="space-y-1 text-sm">
                  <p>Spökbricka: 
                    <span className={`ml-1 ${ghostPieceEnabled ? 'text-green-400' : 'text-red-400'}`}>
                      {ghostPieceEnabled ? 'På' : 'Av'}
                    </span>
                  </p>
                  <p>Ljud: 
                    <span className={`ml-1 ${soundEnabled ? 'text-green-400' : 'text-red-400'}`}>
                      {soundEnabled ? 'På' : 'Av'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Server Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-cyan-400 mb-2">Server</h3>
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    backendConnected 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      backendConnected ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {backendConnected ? 'Ansluten' : 'Frånkopplad'}
                  </div>
                </div>
              </div>

              {/* Topplista Panel */}
              <div className="border border-gray-600 p-4 rounded-lg bg-gray-800/50">
                <h3 className="font-bold text-pink-400 mb-2">Topplista</h3>
                <div className="space-y-1 text-sm">
                  {scores.length > 0 ? (
                    scores.slice(0, 3).map((score, index) => (
                      <div key={score.id} className="flex justify-between">
                        <span className="text-gray-300">{index + 1}. {score.name}</span>
                        <span className="text-white font-bold">{formatScore(score.points)}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">1. ok</span>
                        <span className="text-white font-bold">3,524</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">2. ok</span>
                        <span className="text-white font-bold">2,868</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">3. Anonym</span>
                        <span className="text-white font-bold">890</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
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
                onClick={async () => {
                  await initializeAudio();
                  setShowNameInput(true);
                }}
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
                    await initializeAudio();
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
                onClick={async () => {
                  await initializeAudio();
                  startGame();
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Spela Igen
              </button>
              <button
                onClick={async () => {
                  await initializeAudio();
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
            onClick={async () => {
              await initializeAudio();
              setUiState('menu');
            }}
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
          <Help onBack={async () => {
            await initializeAudio();
            setUiState('menu');
          }} />
        </>
      );
    }

    if (uiState === 'settings') {
      return (
        <>
          <AnimatedBackground />
          <Settings
            ghostPieceEnabled={ghostPieceEnabled}
            soundEnabled={soundEnabled}
            startLevel={startLevel}
            musicEnabled={sounds.musicEnabled}
            soundEffectsEnabled={sounds.soundEffectsEnabled}
            theme={theme}
            onToggleGhostPiece={() => setGhostPieceEnabled(!ghostPieceEnabled)}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onToggleMusic={handleToggleMusic}
            onToggleSoundEffects={handleToggleSoundEffects}
            onStartLevelChange={setStartLevel}
            onThemeChange={handleThemeChange}
            onBack={async () => {
              await initializeAudio();
              setUiState('menu');
            }}
          />
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
                  onClick={async () => {
                    await initializeAudio();
                    setUiState('menu');
                  }}
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


    return (
      <>
        <AnimatedBackground />
        <MainMenu
          onStart={startGame}
          onHelp={async () => {
            await initializeAudio();
            setUiState('help');
          }}
          onInfo={async () => {
            await initializeAudio();
            setUiState('info');
          }}
          onHighscores={async () => {
            await initializeAudio();
            setUiState('highscores');
          }}
          onSettings={async () => {
            await initializeAudio();
            setUiState('settings');
          }}
          onExit={() => {
            if (confirm('Är du säker på att du vill avsluta spelet?')) {

              alert('För att stänga spelet:\n\n• Tryck Ctrl+W (Windows/Linux) eller Cmd+W (Mac)\n• Eller stäng fliken/fönstret manuellt\n\nTack för att du spelade Tetris! 🎮');
            }
          }}
        />
      </>
    );
  }


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