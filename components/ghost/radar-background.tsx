"use client";

export function RadarBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Scan line */}
      <div className="absolute inset-x-0 h-px bg-ghost-green/20 animate-scan-line" />

      {/* Center radar pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Blinking green dot */}
          <div className="w-3 h-3 rounded-full bg-ghost-green animate-blink-green relative z-10" />
          {/* Pulse rings */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-ghost-green/40 animate-radar-pulse"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
