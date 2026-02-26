"use client";

import { useEffect, useState, useRef } from "react";

export function CountdownTimer({ endTime, onExpired }: { endTime: number; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endTime - Date.now()));
  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = (freq: number, duration: number, vol: number = 0.2) => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = freq < 300 ? "sawtooth" : "square";
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + duration);
      osc.connect(gain); gain.connect(audioCtx.current.destination);
      osc.start(); osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = endTime - Date.now();
      const totalSecs = Math.floor(diff / 1000);
      
      // 🔊 Last 3 seconds beeps
      if (totalSecs <= 3 && totalSecs > 0) playSound(800 + (3 - totalSecs) * 300, 0.2);
      
      if (diff <= 0) {
        clearInterval(interval);
        setRemaining(0);
        playSound(80, 1.2, 0.5); // 🔥 Heavy BOOM Sound
        setTimeout(onExpired, 500); // 🚀 Visual Blast
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpired]);

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className={`font-mono text-lg tracking-widest tabular-nums ${totalSeconds < 10 ? "text-red-500 animate-pulse font-black" : "text-ghost-green"}`}>
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}