import { useCallback, useRef, useState, useEffect } from 'react';

interface SoundEffects {
  playLineClear: () => void;
  playTetris: () => void;
  playTSpin: () => void;
  playDrop: () => void;
  playRotate: () => void;
  playGameOver: () => void;
  playLevelUp: () => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  toggleMusic: () => void;
  toggleSoundEffects: () => void;
  resumeAudioContext: () => Promise<void>;
  isMusicPlaying: boolean;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

export const useSound = (enabled: boolean): SoundEffects => {
  const audioContext = useRef<AudioContext | null>(null);
  const musicSource = useRef<AudioBufferSourceNode | null>(null);
  const musicGain = useRef<GainNode | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Initialize audio context only when needed and after user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Don't start playing immediately - wait for user interaction
      } catch (error) {
        console.warn('Failed to create audio context:', error);
      }
    }
  }, []);

  // Resume audio context if suspended - this is the key function for autoplay policy
  const resumeAudioContext = useCallback(async () => {
    try {
      // Create context if it doesn't exist
      if (!audioContext.current) {
        initAudioContext();
      }
      
      // Resume if suspended
      if (audioContext.current && audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
    }
  }, [initAudioContext]);

  // Create background music using Web Audio API
  const createBackgroundMusic = useCallback(async () => {
    if (!audioContext.current || !musicEnabled) return;

    try {
      // Ensure audio context is running
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      // Create a simple Tetris-style melody using oscillators
      const melody = [
        { freq: 220, duration: 0.5 }, // A3
        { freq: 246.94, duration: 0.5 }, // B3
        { freq: 277.18, duration: 0.5 }, // C#4
        { freq: 329.63, duration: 0.5 }, // E4
        { freq: 277.18, duration: 0.5 }, // C#4
        { freq: 246.94, duration: 0.5 }, // B3
        { freq: 220, duration: 1.0 }, // A3
      ];

      let currentTime = audioContext.current.currentTime;
      
      melody.forEach((note, index) => {
        const oscillator = audioContext.current!.createOscillator();
        const gainNode = audioContext.current!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current!.destination);
        
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.05, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });

      // Schedule the next loop
      setTimeout(() => {
        if (musicEnabled && isMusicPlaying) {
          createBackgroundMusic();
        }
      }, currentTime * 1000);

    } catch (error) {
      console.warn('Background music not supported:', error);
    }
  }, [musicEnabled, isMusicPlaying]);

  const createTone = useCallback(async (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEffectsEnabled || !audioContext.current) return;

    try {
      // Ensure audio context is running
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
  }, [soundEffectsEnabled]);

  const playLineClear = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(800, 0.1);
    setTimeout(() => createTone(1000, 0.1), 50);
    setTimeout(() => createTone(1200, 0.2), 100);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playTetris = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(400, 0.1);
    setTimeout(() => createTone(600, 0.1), 50);
    setTimeout(() => createTone(800, 0.1), 100);
    setTimeout(() => createTone(1000, 0.2), 150);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playTSpin = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(600, 0.1, 'square');
    setTimeout(() => createTone(800, 0.1, 'square'), 50);
    setTimeout(() => createTone(1000, 0.2, 'square'), 100);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playDrop = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(200, 0.1);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playRotate = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(300, 0.05);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playGameOver = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(200, 0.2);
    setTimeout(() => createTone(150, 0.2), 200);
    setTimeout(() => createTone(100, 0.3), 400);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playLevelUp = useCallback(async () => {
    if (!soundEffectsEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    
    createTone(500, 0.1);
    setTimeout(() => createTone(700, 0.1), 50);
    setTimeout(() => createTone(900, 0.1), 100);
    setTimeout(() => createTone(1100, 0.2), 150);
  }, [soundEffectsEnabled, createTone, initAudioContext, resumeAudioContext]);

  const playBackgroundMusic = useCallback(async () => {
    if (!musicEnabled) return;
    
    initAudioContext();
    await resumeAudioContext();
    setIsMusicPlaying(true);
    createBackgroundMusic();
  }, [musicEnabled, initAudioContext, resumeAudioContext, createBackgroundMusic]);

  const stopBackgroundMusic = useCallback(() => {
    setIsMusicPlaying(false);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => !prev);
    if (musicEnabled) {
      stopBackgroundMusic();
    } else if (isMusicPlaying) {
      playBackgroundMusic();
    }
  }, [musicEnabled, isMusicPlaying, stopBackgroundMusic, playBackgroundMusic]);

  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled(prev => !prev);
  }, []);

  // Don't auto-start background music - wait for user interaction
  // useEffect(() => {
  //   if (enabled && musicEnabled) {
  //     playBackgroundMusic();
  //   }
  //   return () => {
  //     stopBackgroundMusic();
  //   };
  // }, [enabled, musicEnabled, playBackgroundMusic, stopBackgroundMusic]);

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
    soundEffectsEnabled
  };
};
