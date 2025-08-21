import { useState, useCallback, useRef } from 'react';
import { fetchScores, postScore, Score } from '../api';

// Hook: useScores
// Beskrivning (svenska): En hook som hanterar hämtning och inskickning av high-scores.
// Den kapslar in loading-state, felhantering och en enkel abort-mekanism för
// att avbryta tidigare pågående förfrågningar.

interface UseScoresReturn {
  // State
  topScores: Score[]; // Lista med högsta poäng
  isLoading: boolean; // Indikerar om en förfrågan pågår
  error: string | null; // Felmeddelande vid problem
  
  // Actions
  fetchTopScores: (limit?: number) => Promise<void>; // Hämta topp-poäng (valfritt limit)
  submitScore: (payload: {
    name: string;
    points: number;
    level: number;
    lines: number;
    gameDuration?: number;
  }) => Promise<{ success: boolean; message: string }>; // Skicka in en poäng
  
  // Utilities
  clearError: () => void; // Rensa eventuellt felmeddelande
}

export function useScores(): UseScoresReturn {
  const [topScores, setTopScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Abort controller som används för att avbryta tidigare requests vid ny förfrågan
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Hämta topp-poäng från API:et.
   * Avbryter tidigare pågående förfrågningar för att undvika race conditions.
   */
  const fetchTopScores = useCallback(async (limit = 10) => {
    // Avbryt tidigare förfrågan om den fortfarande pågår
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Skapa ny abort controller för denna förfrågan
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      // OBS: fetchScores förväntas hantera limit; om API stöder abort-signal
      // kan vi skicka 'abortControllerRef.current.signal' som ett argument.
      const scores = await fetchScores(limit);
      setTopScores(scores);
    } catch (caught) {
      // Om förfrågan avbröts så vill vi inte visa ett felmeddelande
      if (caught instanceof Error && (caught as any).name === 'AbortError') {
        return;
      }

      const errorMessage = caught instanceof Error ? caught.message : 'Failed to fetch scores';
      setError(errorMessage);
      console.error('Error fetching top scores:', caught);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Skicka in en poäng till backend.
   * Vid lyckad inskick uppdateras topplistan.
   */
  const submitScore = useCallback(async (payload: {
    name: string;
    points: number;
    level: number;
    lines: number;
    gameDuration?: number;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);
      
      const result = await postScore(payload);
      
      if (result.success && result.data) {
        // Uppdatera topplistan när inskick lyckas
        await fetchTopScores();
        return {
          success: true,
          message: result.data.message || 'Score saved successfully!'
        };
      } else {
        const errorMessage = result.error || 'Failed to save score';
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (caught) {
      const errorMessage = caught instanceof Error ? caught.message : 'Failed to save score';
      setError(errorMessage);
      console.error('Error submitting score:', caught);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [fetchTopScores]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    topScores,
    isLoading,
    error,
    fetchTopScores,
    submitScore,
    clearError
  };
}
