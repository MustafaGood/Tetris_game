import { useCallback, useRef, useState, useEffect } from 'react';

// Hook: useSound
// Beskrivning (svenska): En enkel React-hook för att spela upp ton- och bakgrundsmusik
// via Web Audio API. Den tar en master-flagga `enabled` som kan stänga av all ljudfunktionalitet.

interface SoundEffects {
  // Spelfunktioner
  playLineClear: () => void; // Spela ljud för att rensa en rad
  playTetris: () => void; // Spela Tetris-ljud (flera toner)
  playTSpin: () => void; // Spela T-Spin-ljud
  playDrop: () => void; // Spela ljud för snabb drop
  playRotate: () => void; // Spela ljud för rotation
  playGameOver: () => void; // Spela ljud för game over
  playLevelUp: () => void; // Spela ljud för nivåuppgång

  // Musikkontroll
  playBackgroundMusic: () => void; // Starta loopande bakgrundsmusik
  stopBackgroundMusic: () => void; // Stoppa bakgrundsmusik
  toggleMusic: () => void; // Växla musik på/av
  toggleSoundEffects: () => void; // Växla ljudeffekter på/av

  // Övrigt
  resumeAudioContext: () => Promise<void>; // Försök återuppta AudioContext (brukar krävas pga. auto-play policy)
  isMusicPlaying: boolean; // Indikerar om musiken är aktiv
  musicEnabled: boolean; // Indikerar om musik är tillåten
  soundEffectsEnabled: boolean; // Indikerar om ljudeffekter är tillåtna
}

export const useSound = (enabled: boolean): SoundEffects => {
  // Referenser till AudioContext och eventuella noder
  const audioContext = useRef<AudioContext | null>(null);

  // State: spelmusik och ljudinställningar
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Initiera AudioContext vid behov
  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      // Stöd för webkit-prefixed AudioContext i äldre WebKit-baserade browsers
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Återuppta AudioContext - användbart för att kringgå autoplay-policy
  const resumeAudioContext = useCallback(async () => {
    if (audioContext.current && audioContext.current.state === 'suspended') {
      try {
        await audioContext.current.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }, []);

  // Skapar ett enkelt melodispår med oscillatorer. Loopar genom rekursivt anrop
  const createBackgroundMusic = useCallback(async () => {
    if (!audioContext.current || !musicEnabled || !enabled) return;

    try {
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      // Enkel melodisekvens (kan bytas ut mot buffrad audio senare)
      const melody = [
        { freq: 220, duration: 0.5 },
        { freq: 246.94, duration: 0.5 },
        { freq: 277.18, duration: 0.5 },
        { freq: 329.63, duration: 0.5 },
        { freq: 277.18, duration: 0.5 },
        { freq: 246.94, duration: 0.5 },
        { freq: 220, duration: 1.0 },
      ];

      // Schemalägg toner relativt audioContext.currentTime
      let currentTime = audioContext.current.currentTime;
      melody.forEach((note) => {
        const oscillator = audioContext.current!.createOscillator();
        const gainNode = audioContext.current!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current!.destination);

        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        oscillator.type = 'triangle';

        // Låg volym för bakgrundsmusiken
        gainNode.gain.setValueAtTime(0.05, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);

        currentTime += note.duration;
      });

      // Räkna delay i ms relativt nuvarande audioContext.currentTime
      const totalDuration = Math.max(0, currentTime - audioContext.current.currentTime);
      setTimeout(() => {
        // Kontrollera state igen innan rekursion
        if (musicEnabled && isMusicPlaying && enabled) {
          createBackgroundMusic();
        }
      }, Math.round(totalDuration * 1000));
    } catch (error) {
      console.warn('Background music not supported:', error);
    }
  }, [musicEnabled, isMusicPlaying, enabled]);

  // Skapar en ton (ljudeffekt)
  const createTone = useCallback(async (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEffectsEnabled || !enabled || !audioContext.current) return;

    try {
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [soundEffectsEnabled, enabled]);

  // --- Ljudfunktioner (spelföreteelser) ---
  const playLineClear = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(800, 0.1);
    setTimeout(() => createTone(1000, 0.1), 50);
    setTimeout(() => createTone(1200, 0.2), 100);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  const playTetris = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(400, 0.1);
    setTimeout(() => createTone(600, 0.1), 50);
    setTimeout(() => createTone(800, 0.1), 100);
    setTimeout(() => createTone(1000, 0.2), 150);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  const playTSpin = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(600, 0.1, 'square');
    setTimeout(() => createTone(800, 0.1, 'square'), 50);
    setTimeout(() => createTone(1000, 0.2, 'square'), 100);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  const playDrop = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(200, 0.1);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  const playRotate = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(300, 0.05);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  const playGameOver = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(200, 0.2);
    setTimeout(() => createTone(150, 0.2), 200);
    setTimeout(() => createTone(100, 0.3), 400);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  // Lägg till enabled-kontroll även här för konsekvens
  const playLevelUp = useCallback(async () => {
    if (!soundEffectsEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();

    createTone(500, 0.1);
    setTimeout(() => createTone(700, 0.1), 50);
    setTimeout(() => createTone(900, 0.1), 100);
    setTimeout(() => createTone(1100, 0.2), 150);
  }, [soundEffectsEnabled, enabled, createTone, initAudioContext, resumeAudioContext]);

  // Starta bakgrundsmusik
  const playBackgroundMusic = useCallback(async () => {
    if (!musicEnabled || !enabled) return;

    initAudioContext();
    await resumeAudioContext();
    setIsMusicPlaying(true);
    createBackgroundMusic();
  }, [musicEnabled, enabled, initAudioContext, resumeAudioContext, createBackgroundMusic]);

  // Stoppar loopande bakgrundsmusik (markerar state)
  const stopBackgroundMusic = useCallback(() => {
    setIsMusicPlaying(false);
  }, []);

  // Växla musikläge: använder funktionell uppdatering för att undvika stale closures
  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      // Om vi slår på musiken och användaren redan vill spela musik, starta
      if (next) {
        if (isMusicPlaying) {
          // Om musiken redan markerats som spelande, försök starta uppspelning
          playBackgroundMusic();
        }
      } else {
        // Om vi slår av musiken, stoppa den
        stopBackgroundMusic();
      }
      return next;
    });
  }, [isMusicPlaying, playBackgroundMusic, stopBackgroundMusic]);

  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled((prev) => !prev);
  }, []);

  // När master-flaggan `enabled` ändras: stäng av musik direkt när allt ljud är inaktiverat
  useEffect(() => {
    if (!enabled) {
      setIsMusicPlaying(false);
    }
  }, [enabled]);

  // Rensa när hooken avmonteras
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  return {
    playLineClear,
    playTetris,
    playTSpin,
    playDrop,
    playRotate,
    playGameOver,
    playLevelUp,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleMusic,
    toggleSoundEffects,
    resumeAudioContext,
    isMusicPlaying,
    musicEnabled,
    soundEffectsEnabled,
  };
};
