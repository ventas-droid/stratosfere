"use client";

import { useCallback } from 'react';

export const useTacticalSound = () => {
  
  const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number, vol: number = 0.05) => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
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
  };

  const playClick = useCallback(() => { playTone(800, 'sine', 0.1, 0.05); }, []);
  const playHover = useCallback(() => { playTone(200, 'triangle', 0.05, 0.02); }, []);
  
  const playDeploy = useCallback(() => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }, []);

  const playBoot = useCallback(() => { playDeploy(); setTimeout(() => playTone(1200, 'sine', 0.5, 0.05), 300); }, []);
  const playPing = useCallback(() => { playTone(1500, 'sine', 0.3, 0.08); }, []);

  return { playClick, playHover, playDeploy, playBoot, playPing };
};

