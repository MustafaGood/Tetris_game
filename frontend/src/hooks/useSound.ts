import { useCallback, useRef } from 'react';

interface SoundEffects {
  playLineClear: () => void;
  playTetris: () => void;
  playTSpin: () => void;
  playDrop: () => void;
  playRotate: () => void;
  playGameOver: () => void;
  playLevelUp: () => void;
}

export const useSound = (enabled: boolean): SoundEffects => {
  const audioContext = useRef<AudioContext | null>(null);

  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !audioContext.current) return;

    try {
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
  }, [enabled]);

  const playLineClear = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(800, 0.1);
    setTimeout(() => createTone(1000, 0.1), 50);
    setTimeout(() => createTone(1200, 0.2), 100);
  }, [enabled, createTone]);

  const playTetris = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(400, 0.1);
    setTimeout(() => createTone(600, 0.1), 50);
    setTimeout(() => createTone(800, 0.1), 100);
    setTimeout(() => createTone(1000, 0.2), 150);
  }, [enabled, createTone]);

  const playTSpin = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(600, 0.1, 'square');
    setTimeout(() => createTone(800, 0.1, 'square'), 50);
    setTimeout(() => createTone(1000, 0.2, 'square'), 100);
  }, [enabled, createTone]);

  const playDrop = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(200, 0.1);
  }, [enabled, createTone]);

  const playRotate = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(300, 0.05);
  }, [enabled, createTone]);

  const playGameOver = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(200, 0.2);
    setTimeout(() => createTone(150, 0.2), 200);
    setTimeout(() => createTone(100, 0.3), 400);
  }, [enabled, createTone]);

  const playLevelUp = useCallback(() => {
    if (!enabled) return;
    
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    createTone(500, 0.1);
    setTimeout(() => createTone(700, 0.1), 50);
    setTimeout(() => createTone(900, 0.1), 100);
    setTimeout(() => createTone(1100, 0.2), 150);
  }, [enabled, createTone]);

  return {
    playLineClear,
    playTetris,
    playTSpin,
    playDrop,
    playRotate,
    playGameOver,
    playLevelUp
  };
};
