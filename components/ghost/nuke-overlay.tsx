"use client";

import { useEffect, useState } from "react";

interface NukeOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export function NukeOverlay({ active, onComplete }: NukeOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-destructive animate-nuke-flash"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-mono font-bold text-destructive-foreground tracking-[0.3em] animate-glitch">
          TERMINATED
        </h1>
        <p className="text-sm font-mono text-destructive-foreground/60 tracking-wider">
          SECURITY BREACH DETECTED
        </p>
      </div>
    </div>
  );
}
