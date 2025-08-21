import React, { useState, useEffect } from 'react';
import { Score, formatScore } from '../api';
import { useScores } from '../hooks/useScores';

/*
  GameOver.tsx
  ----------------
  Svenska kommentarer och förklaringar:
  Denna komponent visar slutresultatet när spelet är slut och erbjuder
  spelaren att spara sin poäng antingen online (om backend är tillgängligt)
  eller lokalt i `localStorage`.

  Viktiga delar:
  - Beräkning av om resultatet är en lokal highscore (enkelt: top 10).
  - Skicka poäng till backend via `useScores().submitScore`.
  - Spara alltid en lokal kopia (för offline-åtkomst) i `tetrisScores`.
  - UI innehåller feedback-meddelanden och valideringsinfo.

  Kommentarerna i filen förklarar vad varje huvudfunktion gör utan att
  ändra existerande beteende.
*/

interface GameOverProps {
  points: number;
  level: number;
  lines: number;
  gameDuration?: number;
  backendConnected: boolean | null;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onScoreSaved?: (scores: Score[]) => void;
}

export default function GameOver({ 
  points, 
  level, 
  lines, 
  gameDuration,
  backendConnected, 
  onPlayAgain, 
  onMainMenu,
  onScoreSaved 
}: GameOverProps) {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLocalHighscore, setIsLocalHighscore] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  const { submitScore, fetchTopScores } = useScores();

  useEffect(() => {
    // Kontrollera om det här resultatet kvalificerar som en lokal highscore.
    // Vi tar högst 10 lokala scores och jämför mot befintliga poäng.
    // Använder try/catch eftersom localStorage kan innehålla korrupt JSON.
    try {
      const localScores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
      const isHighscore = localScores.length < 10 || 
        localScores.some((score: any) => points > score.score);
      setIsLocalHighscore(isHighscore);
    } catch (e) {
      // Vid fel: anta att det inte är en lokal highscore
      setIsLocalHighscore(false);
    }
  }, [points]);

  const handleSaveScore = async () => {
    // Skicka poäng till backend. Förutsätter att backend är tillgänglig
    // och att spelaren angett ett namn. Funktionen visar feedback-meddelanden
    // baserat på svaret från servern och sparar alltid en lokal kopia.
    if (!playerName.trim() || !backendConnected) return;

    setSaveMessage('');
    setValidationMessage('');

    try {
      const scorePayload = {
        name: playerName.trim(),
        points,
        level,
        lines,
        gameDuration
      };

      // Debug-logg (ofarlig): visar payload i konsolen vid utveckling
      console.log('🔍 Debug - Score payload being sent:', scorePayload);

      const result = await submitScore(scorePayload);

      if (result.success) {
        // Lyckad spara: visa feedback, uppdatera topplista och spara lokalt
        setSaveMessage('✅ Poäng sparade!');
        setShowNameInput(false);
        
        if (onScoreSaved) {
          await fetchTopScores(10);
        }
        
        saveLocalScore();
        
        // Rensa meddelanden efter en kort stund
        setTimeout(() => {
          setSaveMessage('');
          setValidationMessage('');
          setPlayerName('');
        }, 3000);
      } else {
        // Servern svarade med ett felmeddelande
        setSaveMessage(`❌ Fel: ${result.message}`);
        
        if (result.message?.includes('validation failed') || result.message?.includes('Name must be')) {
          setValidationMessage('🛡️ Validering misslyckades - kontrollera dina uppgifter');
        }
      }
    } catch (error) {
      // Nätverks- eller serverfel
      setSaveMessage('❌ Fel: Kunde inte ansluta till servern');
      console.error('Misslyckades att skicka score till server:', error);
    }
  };

  const saveLocalScore = () => {
    // Spara en lokal kopia av poängen. Funktionen läser befintliga lokala
    // scores, adderar den nya, sorterar och truncerar till max 10 poster.
    try {
      const localScores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
      const newScore = {
        id: Date.now(),
        playerName: playerName.trim(),
        score: points,
        level,
        lines,
        date: new Date().toISOString()
      };
      
      localScores.push(newScore);
      localScores.sort((a: any, b: any) => b.score - a.score);
      
      if (localScores.length > 10) {
        localScores.splice(10);
      }
      
      localStorage.setItem('tetrisScores', JSON.stringify(localScores));
    } catch (e) {
      // Logga men bryt inte UI-flödet: lokal sparning är en bekvämlighet
      // och ska inte orsaka att spelet kraschar.
      console.error('Misslyckades att spara lokal poäng:', e);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveScore();
  };

  // Hanterar formulärinlämning för spelarnamn. Kallar handleSaveScore.

  const formatGameDuration = (duration?: number): string => {
  // Formatera millisekunder till MM:SS för visning i Game Over-dialogen
  if (!duration) return '';
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Game Over</h2>
        
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {formatScore(points)}
          </div>
          <div className="text-gray-300">
            Nivå {level} • {lines} rader
            {gameDuration && (
              <div className="text-sm text-gray-400 mt-1">
                Speltid: {formatGameDuration(gameDuration)}
              </div>
            )}
          </div>
        </div>

        {backendConnected && !showNameInput && (
          <div className="mb-6">
            <button
                  onClick={() => setShowNameInput(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                >
                  Spara poäng online
                </button>
          </div>
        )}

        {showNameInput && (
          <form onSubmit={handleNameSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-white mb-2">
                Ditt namn (1-16 tecken):
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={16}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Ange ditt namn..."
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              Spara poäng
            </button>
          </form>
        )}

        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            saveMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        {validationMessage && (
          <div className="mb-4 p-3 rounded-lg text-center bg-blue-500/20 text-blue-400">
            {validationMessage}
          </div>
        )}

        {isLocalHighscore && !backendConnected && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-center">
              🏆 Ny lokal highscore! (Ingen anslutning till servern)
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            Spela Igen
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            Huvudmeny
          </button>
        </div>
      </div>
    </div>
  );
}

