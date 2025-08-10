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
  rotate, 
  tickSpeed, 
  W, 
  calculateScore,
  isGameOver
} from './tetris';
import { fetchScores, postScore, deleteScore, testConnection, Score, formatDate, formatScore } from './api';
import GameBoard from './components/GameBoard';
import SidePanel from './components/SidePanel';
import MainMenu from './components/MainMenu';
import AnimatedBackground from './components/AnimatedBackground';

// Möjliga spel-lägen
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'help' | 'info' | 'highscores';

// Custom hook för intervall
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Huvudkomponenten för spelet
export default function App() {
  // State-variabler för spelet
  const [gameState, setGameState] = useState<GameState>('menu');
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
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

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
    if (over && backendConnected) {
      fetchScores(10).then(setScores).catch(() => {});
    }
  }, [over, backendConnected]);

  // Laddar highscores när man går till highscores-sidan
  useEffect(() => { 
    if (gameState === 'highscores' && backendConnected) {
      fetchScores(100).then(setScores).catch(() => {});
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
    if (over || paused) return;
    let p = { ...cur };
    while (!collide(board, { ...p, y: p.y + 1 })) p.y++;
    lockPiece(p);
  }, [cur, board, over, paused]);

  // Mjuk fall (soft drop)
  const softDrop = useCallback(() => {
    if (over || paused) return;
    const p = { ...cur, y: cur.y + 1 };
    if (!collide(board, p)) setCur(p);
    else lockPiece(cur);
  }, [cur, board, over, paused]);

  // Flytta block
  const move = useCallback((dx: number) => {
    if (over || paused) return;
    const p = { ...cur, x: cur.x + dx };
    if (!collide(board, p)) setCur(p);
  }, [cur, board, over, paused]);

  // Rotera block
  const rotateCur = useCallback((dir: 1 | -1) => {
    if (over || paused) return;
    const r = rotate(cur, dir);
    if (!collide(board, r)) setCur(r);
  }, [cur, board, over, paused]);

  // Lås block på plats
  const lockPiece = useCallback((p: Piece) => {
    const newBoard = [...board];
    merge(newBoard, p);
    const cleared = clearLines(newBoard);
    
    if (cleared > 0) {
      const newLines = lines + cleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const scoreGain = calculateScore(cleared, level);
      
      setLines(newLines);
      setLevel(newLevel);
      setPoints(prev => prev + scoreGain);
    }
    
    setBoard(newBoard);
    
    // Kontrollera game over
    if (isGameOver(newBoard)) {
      setOver(true);
      setGameState('gameOver');
      return;
    }
    
    newPiece();
  }, [board, lines, level, newPiece]);

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
    bag.reset();
    setNextIds([bag.next(), bag.next(), bag.next(), bag.next(), bag.next()]);
  }, [bag]);

  // Starta spel
  const startGame = useCallback(() => {
    reset();
    setGameState('playing');
  }, [reset]);

  // Pausa spel
  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setPaused(true);
      setGameState('paused');
    } else if (gameState === 'paused') {
      setPaused(false);
      setGameState('playing');
    }
  }, [gameState]);



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

  // Tangentbordskontroller
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameState !== 'playing' && gameState !== 'paused') return;
      
      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          move(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          move(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotateCur(1);
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyC':
          e.preventDefault();
          holdPiece();
          break;
        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          pauseGame();
          break;
        case 'KeyR':
          e.preventDefault();
          reset();
          break;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, move, softDrop, rotateCur, hardDrop, holdPiece, pauseGame, reset]);

  // Spelloop med intervall
  useInterval(() => {
    if (gameState === 'playing' && !paused && !over) {
      softDrop();
    }
  }, gameState === 'playing' && !paused ? tickSpeed(level) : null);

  // Renderar olika skärmar baserat på gameState
  switch (gameState) {
    case 'menu':
      return (
        <>
          <AnimatedBackground />
          <MainMenu
            onStart={startGame}
            onHelp={() => setGameState('help')}
            onInfo={() => setGameState('info')}
            onHighscores={() => setGameState('highscores')}
            onExit={() => window.close()}
          />
        </>
      );

    case 'playing':
    case 'paused':
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-6xl mx-auto flex gap-8 items-start justify-center">
              {/* Spelplan */}
              <div className="flex-shrink-0">
                <GameBoard grid={board} currentPiece={cur} />
                
                {/* Paus-overlay */}
                {paused && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center">
                      <h2 className="text-2xl font-bold text-white mb-4">Pausat</h2>
                      <p className="text-gray-300 mb-4">Tryck P eller Esc för att fortsätta</p>
            <button 
              onClick={() => setGameState('menu')}
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
          scores={scores}
          backendConnected={backendConnected}
          onQuit={() => setGameState('menu')}
        />
      </div>
    </div>
        </>
      );

    case 'gameOver':
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
                onClick={() => setGameState('menu')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Huvudmeny
          </button>
        </div>
      </div>
    </div>
        </>
      );

    case 'highscores':
  return (
        <>
          <AnimatedBackground />
          <div className="min-h-screen p-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-600">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Highscores</h2>
              
              {scores.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        {backendConnected && (
                    <button
                            onClick={() => handleDeleteScore(score.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            🗑️
                    </button>
                        )}
                </div>
              </div>
            ))}
          </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {backendConnected ? 'Inga highscores ännu' : 'Kan inte ansluta till servern'}
          </div>
        )}

          <button
                onClick={() => setGameState('menu')}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
                Tillbaka
          </button>
        </div>
      </div>
    </div>
        </>
      );

    case 'help':
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
          </div>
                  
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      Ny nivå var 10:e rad. Spelet går snabbare på högre nivåer!
                    </p>
      </div>
                </div>
              </div>

          <button
                onClick={() => setGameState('menu')}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Tillbaka
          </button>
      </div>
      </div>
      </div>
        </>
      );

    case 'info':
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
                  onClick={() => setGameState('menu')}
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                >
                  Tillbaka
                </button>
        </div>
            </div>
            </div>
        </>
      );

    default:
      return null;
  }
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