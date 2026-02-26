"use client";

import { ShieldOff } from "lucide-react";

export function BannedScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 grid-bg">
      <div className="relative">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-lg font-mono text-destructive tracking-[0.2em]">
          FREQUENCY DENIED
        </h1>
        <p className="text-xs font-mono text-muted-foreground text-center max-w-xs leading-relaxed">
          Your signal has been blacklisted for 24 hours.
          No radar activity will be visible during this period.
        </p>
      </div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-destructive/40"
          />
        ))}
      </div>
    </div>
  );
}
