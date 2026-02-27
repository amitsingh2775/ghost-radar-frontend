"use client";

import dynamic from "next/dynamic";

// GhostPulseApp ko dynamic import karein aur SSR (Server Side Rendering) disable karein
const GhostPulseApp = dynamic(
  () => import("@/components/ghost/ghost-pulse-app").then((mod) => mod.GhostPulseApp),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center font-mono text-ghost-green animate-pulse uppercase text-xs tracking-[0.3em]">
        Initializing Neural Link...
      </div>
    )
  }
);

export default function Home() {
  return <GhostPulseApp />;
}