import { useState, useEffect, Fragment } from 'react';
import { deleteScore, Score, formatScore, formatDate } from '../api';
import { useScores } from '../hooks/useScores';

/*
  Leaderboard.tsx
  ----------------
  Svenska kommentarer och förklaringar:
  Denna komponent visar både online- och lokala highscores.
  - Online: hämtas via `useScores`-hooken mot backend (om tillgänglig).
  - Lokalt: sparas i localStorage under nyckeln "tetrisScores".

  Funktioner:
  - Visa, markera och ta bort scores (enkelt urval och massurval).
  - Robust läsning/skrivning av localStorage (try/catch för fel).
  - Formatering av tid, datum och poäng via `api`-hjälpare.

  Observera: Funktionaliteten förändras inte — endast kommentarer och
  förklaringar läggs till för bättre läsbarhet.
*/

interface LeaderboardProps {
  backendConnected: boolean | null;
  onBack: () => void;
  onScoreDeleted?: (scores: Score[]) => void;
}

interface LocalScore {
  id: number;
  playerName: string;
  score: number;
  level: number;
  lines: number;
  date: string;
}

export default function Leaderboard({ 
  backendConnected, 
  onBack,
  onScoreDeleted 
}: LeaderboardProps) {
  const { topScores, isLoading, error, fetchTopScores, clearError } = useScores();
  const [localScores, setLocalScores] = useState<LocalScore[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedLocalIds, setSelectedLocalIds] = useState<number[]>([]);
  const [selectedOnlineIds, setSelectedOnlineIds] = useState<string[]>([]);
  const [isBulkDeletingOnline, setIsBulkDeletingOnline] = useState<boolean>(false);

  const fetchLocalScores = () => {
    // Läs lokala highscores från localStorage.
    // Vi använder try/catch eftersom data kan vara korrupt eller saknas.
    try {
      const stored = localStorage.getItem('tetrisScores');
      if (stored) {
        const scores = JSON.parse(stored);
        // Uppdatera lokal state och behåll endast tidigare valda IDs som fortfarande finns kvar
        setLocalScores(scores);
        setSelectedLocalIds(prev => prev.filter(id => scores.some((s: LocalScore) => s.id === id)));
      }
    } catch (err) {
      // Vid fel: logga och nollställ lokala scores för att undvika krasch
      console.error('Misslyckades att läsa lokala highscores:', err);
      setLocalScores([]);
    }
  };

  const toggleSelectLocal = (id: number) => {
    setSelectedLocalIds(prev => prev.includes(id)
      ? prev.filter(item => item !== id)
      : [...prev, id]
    );
  };

  /**
   * Väljer/avmarkerar en lokal score.
   * - Tar id som argument
   * - Uppdaterar state-listan `selectedLocalIds`
   */

  const selectAllLocal = () => {
    setSelectedLocalIds(localScores.map(s => s.id));
  };

  const clearLocalSelection = () => {
    setSelectedLocalIds([]);
  };

  const deleteSelectedLocal = () => {
    if (selectedLocalIds.length === 0) return;
    try {
  // Ta bort de valda lokala scores från localStorage och uppdatera lokal state.
  const current = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
  const remaining = current.filter((s: LocalScore) => !selectedLocalIds.includes(s.id));
  localStorage.setItem('tetrisScores', JSON.stringify(remaining));
  setLocalScores(remaining);
  setSelectedLocalIds([]);
    } catch (err) {
  console.error('Misslyckades att ta bort valda lokala highscores:', err);
    }
  };

  const toggleSelectOnline = (id: string) => {
    setSelectedOnlineIds(prev => prev.includes(id)
      ? prev.filter(item => item !== id)
      : [...prev, id]
    );
  };

  /**
   * Markera/avmarkera en online score i listan (för massradering).
   */

  const selectAllOnline = () => {
    setSelectedOnlineIds(topScores.map(getScoreId).filter(Boolean));
  };

  const clearOnlineSelection = () => {
    setSelectedOnlineIds([]);
  };

  const deleteSelectedOnline = async () => {
    if (!backendConnected || selectedOnlineIds.length === 0 || isBulkDeletingOnline) return;
    setIsBulkDeletingOnline(true);
    try {
  // Skicka borttagnings-förfrågningar parallellt och uppdatera därefter listan.
  const ids = [...selectedOnlineIds];
  await Promise.allSettled(ids.map(id => deleteScore(id)));
  await fetchTopScores();
  setSelectedOnlineIds([]);
  setLastUpdated(new Date());
    } catch (err) {
  console.error('Misslyckades med massradering av online scores:', err);
    } finally {
      setIsBulkDeletingOnline(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (!backendConnected || isDeleting) return;
    
    setIsDeleting(id);
    
    try {
      const result = await deleteScore(id);
      if (result.success) {
        await fetchTopScores();
        
        if (onScoreDeleted) {
          onScoreDeleted(topScores);
        }
      } else {
        console.error(`Kunde inte ta bort score: ${result.error}`);
      }
    } catch (err) {
      console.error('Misslyckades att ta ta bort score:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    if (backendConnected) {
      fetchTopScores(10); 
      setLastUpdated(new Date());
    }
    fetchLocalScores();
  }, [backendConnected, fetchTopScores]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchLocalScores();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatGameDuration = (duration?: number): string => {
  // Formatera spel-längd (ms) till MM:SS
  if (!duration) return '-';
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderOnlineScoresTable = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Hämtar highscores...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">❌ {error}</div>
          <button
            onClick={() => {
              clearError();
              fetchTopScores(10);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Försök igen
          </button>
        </div>
      );
    }

    if (topScores.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">Inga resultat</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {/* Välj alla: checkbox för att snabbt markera alla online-results */}
              <th className="text-left py-3 px-2 text-gray-300">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-500"
                  checked={selectedOnlineIds.length > 0 && selectedOnlineIds.length === topScores.map(getScoreId).filter(Boolean).length}
                  onChange={(e) => e.target.checked ? selectAllOnline() : clearOnlineSelection()}
                  aria-label="Markera alla online scores"
                />
              </th>
              <th className="text-left py-3 px-2 text-gray-300">#</th>
              <th className="text-left py-3 px-2 text-gray-300">Name</th>
              <th className="text-left py-3 px-2 text-gray-300">Score</th>
              <th className="text-left py-3 px-2 text-gray-300">Level</th>
              <th className="text-left py-3 px-2 text-gray-300">Time</th>
              <th className="text-left py-3 px-2 text-gray-300">Date</th>
              {backendConnected && (
                <th className="text-left py-3 px-2 text-gray-300">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {topScores.map((score, index) => (
              <tr key={score.id || score._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                {/* Rad-checkbox: välj en specifik online score för åtgärder */}
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-500"
                    checked={selectedOnlineIds.includes(getScoreId(score))}
                    onChange={() => toggleSelectOnline(getScoreId(score))}
                    aria-label={`Markera online score #${index + 1}`}
                  />
                </td>
                <td className="py-3 px-2 text-gray-400">{index + 1}</td>
                <td className="py-3 px-2 font-medium text-white">{score.name}</td>
                <td className="py-3 px-2 text-yellow-400 font-bold">{formatScore(score.points)}</td>
                <td className="py-3 px-2 text-gray-300">{score.level}</td>
                <td className="py-3 px-2 text-gray-400">{formatGameDuration(score.gameDuration)}</td>
                <td className="py-3 px-2 text-gray-400">{formatDate(score.createdAt)}</td>
                {backendConnected && (
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleDeleteScore(String(score.id || score._id))}
                      disabled={isDeleting === String(score.id || score._id) || isBulkDeletingOnline}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 text-xs"
                    >
                      {isDeleting === String(score.id || score._id) ? 'Tar bort...' : 'Ta bort'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getScoreId = (score: Score): string => {
    return String(score._id || score.id || '');
  };

  /**
   * Hjälpare: returnerar id för en score-objekt som sträng.
   * Vi försöker använda `_id` (mongodb), annars `id`. Om inget finns
   * returneras en tom sträng.
   */

  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just nu';
    if (minutes === 1) return '1 minut sedan';
    return `${minutes} minuter sedan`;
  };

  /**
   * Visningshjälpare: returnerar ett användarvänligt tidssteg sedan
   * senaste uppdatering (t.ex. "Just nu", "1 minut sedan").
   */

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-600">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Highscores</h2>
          
          <Fragment key="content-container">
            {/* Backend-status */}
            {backendConnected === false && (
              <div key="backend-status" className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-center">
                  ⚠️ Ingen anslutning till servern - endast lokala highscores visas
                </p>
              </div>
            )}

            {/* Online Highscores */}
            {backendConnected && (
              <div key="online-scores" className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">🌐 Online Highscores</h3>
                  <div className="flex items-center gap-4">
                    {lastUpdated && (
                      <span className="text-gray-400 text-sm">
                        Uppdaterad: {formatLastUpdated(lastUpdated)}
                      </span>
                    )}
                    <button
                      onClick={() => fetchTopScores()}
                      disabled={isLoading}
                      className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                      title="Uppdatera highscores"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                {/* Added: online selection toolbar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">
                    {selectedOnlineIds.length > 0 ? `${selectedOnlineIds.length} valda` : 'Inga valda'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllOnline}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
                      disabled={topScores.length === 0}
                    >
                      Markera alla
                    </button>
                    <button
                      onClick={clearOnlineSelection}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
                      disabled={selectedOnlineIds.length === 0}
                    >
                      Avmarkera
                    </button>
                    <button
                      onClick={deleteSelectedOnline}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-50"
                      disabled={selectedOnlineIds.length === 0 || isBulkDeletingOnline}
                      title="Ta bort valda online highscores"
                    >
                      {isBulkDeletingOnline ? 'Tar bort...' : 'Ta bort valda'}
                    </button>
                  </div>
                </div>
                
                {renderOnlineScoresTable()}
              </div>
            )}

            {/* Lokala Highscores */}
            <div key="local-scores" className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">💾 Lokala Highscores</h3>
              
              {localScores.length > 0 ? (
                <div key="local-scores-list" className="space-y-2 max-h-64 overflow-y-auto">
                  {/* Urvalsverktyg */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">
                      {selectedLocalIds.length > 0 ? `${selectedLocalIds.length} valda` : 'Inga valda'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllLocal}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
                        disabled={localScores.length === 0}
                      >
                        Markera alla
                      </button>
                      <button
                        onClick={clearLocalSelection}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
                        disabled={selectedLocalIds.length === 0}
                      >
                        Avmarkera
                      </button>
                      <button
                        onClick={deleteSelectedLocal}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-50"
                        disabled={selectedLocalIds.length === 0}
                        title="Ta bort valda lokala highscores"
                      >
                        Ta bort valda
                      </button>
                    </div>
                  </div>
                  {localScores.map((score, index) => (
                    <div key={score.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-500"
                          checked={selectedLocalIds.includes(score.id)}
                          onChange={() => toggleSelectLocal(score.id)}
                          aria-label={`Markera lokal score #${index + 1}`}
                        />
                        <span className="text-gray-400 w-8 text-center">#{index + 1}</span>
                        <span className="text-white font-bold">{score.playerName}</span>
                        <span className="text-xs text-gray-500" title="Lokal score">
                          💾
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-white font-bold">{formatScore(score.score)}</div>
                          <div className="text-gray-400 text-sm">
                            Nivå {score.level} • {score.lines} rader
                          </div>
                        </div>
                        <div className="text-gray-500 text-sm w-24 text-right">
                          {new Date(score.date).toLocaleDateString('sv-SE')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div key="no-local-scores" className="text-center text-gray-400 py-8">
                  <p>Inga lokala highscores ännu</p>
                  <p className="text-sm">Spela spelet för att skapa dina första highscores!</p>
                </div>
              )}
            </div>

            {/* Tillbaka-knapp */}
            <button
              onClick={onBack}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              Tillbaka
            </button>
          </Fragment>
        </div>
      </div>
    </div>
  );
}
