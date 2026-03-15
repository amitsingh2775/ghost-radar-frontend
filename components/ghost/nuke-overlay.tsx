"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Zap } from "lucide-react";

interface NukeOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export function NukeOverlay({ active, onComplete }: NukeOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "charging" | "blast">("idle");

  useEffect(() => {
    if (active) {
      setPhase("charging");
      
      const blastTimer = setTimeout(() => {
        setPhase("blast");
      }, 800);

      const completeTimer = setTimeout(() => {
        setPhase("idle");
        onComplete();
      }, 2200);

      return () => {
        clearTimeout(blastTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [active, onComplete]);

  if (phase === "idle") return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center transition-all duration-300 pointer-events-none px-4
        ${phase === "charging" ? "bg-destructive/20 backdrop-blur-md" : "bg-white"}
      `}
    >
      {/* CHARGING WARNING */}
      {phase === "charging" && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm">
          <div className="relative">
             <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-destructive animate-vibrate" />
             <div className="absolute inset-0 bg-destructive/40 blur-2xl sm:blur-3xl rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-2 text-center w-full">
            <h1 className="text-xl sm:text-4xl font-mono font-black text-white tracking-widest sm:tracking-[0.5em] animate-glitch break-words">
              DESTROYING ROOM...
            </h1>
            <p className="text-destructive font-mono text-[10px] sm:text-xs tracking-widest uppercase opacity-80">
              Room and Message history destroyed...
            </p>
          </div>

          <div className="w-full max-w-[240px] sm:max-w-64 h-1.5 bg-black/40 rounded-full overflow-hidden border border-destructive/30">
            <div className="h-full bg-destructive animate-loading-bar" />
          </div>
        </div>
      )}

      {/* THE BLAST Expansion */}
      {phase === "blast" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-4">
          {/* Explosion circle */}
          <div className="w-4 h-4 bg-white rounded-full animate-nuke-expand shadow-[0_0_100px_50px_white]" />
          
          <div className="relative z-50 flex flex-col items-center gap-3 animate-glitch text-center">
             <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-black fill-current" />
             <span className="text-black font-black text-xl sm:text-3xl font-mono tracking-widest sm:tracking-[0.6em] uppercase">
               ROOM DESTROYED
             </span>
          </div>
        </div>
      )}
    </div>
  );
}