"use client";

import { useEffect, useState } from "react";

export function NukeOverlay({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
    }
  }, [active]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white overflow-hidden pointer-events-none">
   
      <div 
        className="absolute inset-0 bg-white animate-game-blast" 
        onAnimationEnd={() => {
          setShouldRender(false);
          onComplete(); // Iske baad Radar Screen par bhejega
        }} 
      />
   
      <div className="relative z-[10001] font-mono text-8xl font-black text-black tracking-tighter animate-shockwave">
        BOOM
      </div>
    </div>
  );
}