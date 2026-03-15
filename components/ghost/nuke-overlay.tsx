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
      
      //  Sudden warning pulse for 800ms
      const blastTimer = setTimeout(() => {
        setPhase("blast");
      }, 800);

      //  Total expansion and room cleanup
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
      className={`fixed inset-0 z-[999] flex items-center justify-center transition-all duration-300 pointer-events-none
        ${phase === "charging" ? "bg-destructive/20 backdrop-blur-md" : "bg-white"}
      `}
    >
      {/* CHARGING WARNING */}
      {phase === "charging" && (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <ShieldAlert className="w-20 h-20 text-destructive animate-vibrate" />
             <div className="absolute inset-0 bg-destructive/40 blur-3xl rounded-full animate-pulse" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-mono font-black text-white tracking-[0.5em] animate-glitch">
              Destroying Room...
            </h1>
            <p className="text-destructive font-mono text-xs tracking-[0.3em] uppercase">
              Room and Message history destroyed....
            </p>
          </div>
          <div className="w-64 h-1.5 bg-ghost-deep rounded-full overflow-hidden border border-destructive/30">
            <div className="h-full bg-destructive animate-loading-bar" />
          </div>
        </div>
      )}

      {/* THE BLAST Expansion */}
      {phase === "blast" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="w-2 h-2 bg-white rounded-full animate-nuke-expand shadow-[0_0_100px_50px_white]" />
          <div className="relative z-50 flex flex-col items-center gap-2 animate-glitch">
             <Zap className="w-16 h-16 text-black fill-current" />
             <span className="text-black font-black text-3xl font-mono tracking-[0.6em]">ROOM DESTROYED</span>
          </div>
        </div>
      )}
    </div>
  );
}