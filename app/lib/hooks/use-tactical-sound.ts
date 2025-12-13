import { useEffect, useRef, useCallback } from 'react';

export const useTacticalSound = (enabled: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);
  
  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.05) => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [initAudio]);

  return {
    playHover: useCallback(() => playTone(600, 'sine', 0.05, 0.005), [playTone]),
    playClick: useCallback(() => playTone(1200, 'sine', 0.05, 0.02), [playTone]),
    playPing: useCallback(() => playTone(800, 'sine', 0.3, 0.05), [playTone]),
    playDeploy: useCallback(() => { playTone(150, 'sine', 0.2, 0.02); setTimeout(() => playTone(300, 'sine', 0.3, 0.02), 80); }, [playTone]),
    playBoot: useCallback(() => { playTone(100, 'sine', 0.4, 0.05); setTimeout(() => playTone(1500, 'sine', 0.8, 0.01), 300); }, [playTone]),
  };
};


