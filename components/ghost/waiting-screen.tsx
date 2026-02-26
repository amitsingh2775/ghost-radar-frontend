"use client";

import { Loader2, ArrowLeft } from "lucide-react";

interface WaitingScreenProps {
  onBack: () => void;
}

export function WaitingScreen({ onBack }: WaitingScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col grid-bg">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-ghost-surface transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-ghost-green animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-mono text-ghost-green tracking-wider">
            SENDING PULSE...
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/60">
            Waiting for signal owner to accept
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ghost-green animate-blink-green"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
