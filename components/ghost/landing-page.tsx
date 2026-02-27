"use client";

import Image from "next/image";
import { Shield, Zap, Lock } from "lucide-react";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between grid-bg px-6 py-10 md:py-12 overflow-hidden bg-[#0D0D0D]">
      {/* Top Bar - Static Status */}
      <div className="w-full max-w-6xl flex justify-between items-center opacity-40">
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-ghost-green" /> {/* Animation removed */}
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-mono">Status: Undetected</span>
        </div>
        <span className="text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-mono">v1.0.4_neural</span>
      </div>

      {/* Main Hero Section - Removed slide-in animations */}
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 w-full">
        
        {/* Static Logo Container - Removed pulse and ping rings */}
        <div className="relative group cursor-pointer" onClick={onEnter}>
          <div className="relative p-2.5 md:p-4 rounded-full bg-ghost-surface border border-ghost-green/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover:border-ghost-green transition-colors duration-300">
            <Image 
              src="/icon-512x512.png" 
              alt="Ghost Radar Logo" 
              width={140} 
              height={140} 
              className="w-20 h-20 md:w-32 md:h-32 object-contain"
              priority 
            />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2.5 px-2">
          <h1 className="text-5xl md:text-7xl font-mono font-black tracking-tighter uppercase italic leading-none text-white">
            Ghost <span className="text-ghost-green text-shadow-glow">Radar</span>
          </h1>
          <p className="max-w-[280px] md:max-w-md mx-auto text-[11px] md:text-base text-muted-foreground/80 font-mono tracking-wide leading-relaxed">
            Neural signals for hyper-local shadows. <br className="hidden md:block" /> 
            Connect in <span className="text-ghost-green">Tech Parks</span>, 
            <span className="text-ghost-green"> Colleges</span>, or 
            <span className="text-ghost-green"> Concerts</span>.
          </p>
        </div>

        {/* Button - Simplified transitions */}
        <button
          onClick={onEnter}
          className="group relative mt-2 px-8 py-3.5 md:px-12 md:py-4 w-[85%] max-w-[240px] md:max-w-xs bg-ghost-green text-primary-foreground font-mono font-bold text-[11px] md:text-sm tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          INITIALIZE SIGNAL
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-8 w-full max-w-4xl opacity-60">
        <FeatureItem 
          icon={<Lock className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Edge" 
          desc="E2E Encryption" 
        />
        <FeatureItem 
          icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Vanish" 
          desc="Auto-destruct" 
        />
        <FeatureItem 
          icon={<Shield className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Stealth" 
          desc="Zero-log policy" 
        />
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 md:gap-2 text-center p-3 md:p-5 border border-border/40 rounded-lg bg-ghost-surface/20 backdrop-blur-sm">
      <div className="text-ghost-green">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[9px] md:text-[11px] uppercase tracking-tighter md:tracking-widest font-bold text-white">{title}</h3>
        <p className="hidden md:block text-[9px] text-muted-foreground uppercase leading-tight">
          {desc}
        </p>
      </div>
    </div>
  );
}