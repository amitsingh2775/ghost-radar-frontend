"use client";

import Image from "next/image";
import { Shield, Zap, Lock, EyeOff, MessageSquare, MapPin } from "lucide-react";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between grid-bg px-6 py-10 md:py-12 overflow-hidden bg-[#0D0D0D]">
      
      {/* --- Top Bar: System Status --- */}
      <div className="w-full max-w-6xl flex justify-between items-center opacity-50">
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-ghost-green animate-pulse" />
          <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-mono text-ghost-green">
            Protocol: Neural_Pulse_Active
          </span>
        </div>
        <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase font-mono text-white/40">
          v1.0.4_secured
        </span>
      </div>

      {/* --- Main Hero Section --- */}
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 w-full">
        
        {/* Animated Logo Container */}
        <div className="relative group cursor-pointer" onClick={onEnter}>
          {/* Inner Glow and Border */}
          <div className="relative p-3 md:p-5 rounded-full bg-ghost-surface border border-ghost-green/20 shadow-[0_0_40px_rgba(34,197,94,0.1)] group-hover:border-ghost-green/50 transition-all duration-700">
            <Image 
              src="/icon-512x512.png" 
              alt="Ghost Radar Logo" 
              width={140} 
              height={140} 
              className="w-20 h-20 md:w-32 md:h-32 object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              priority 
            />
          </div>
        </div>

        {/* Hero Typography: Chat App Branding */}
        <div className="space-y-3 px-2">
          <h1 className="text-5xl md:text-7xl font-mono font-black tracking-tighter uppercase italic leading-none text-white">
            Ghost <span className="text-ghost-green text-shadow-glow">Radar</span>
          </h1>
          <p className="max-w-[300px] md:max-w-lg mx-auto text-[11px] md:text-base text-muted-foreground/80 font-mono tracking-wide leading-relaxed">
  <span className="text-ghost-green font-bold">The ultimate anonymous chat app for people nearby.</span>
  <br className="hidden md:block" />
  Chat with people around you without revealing who you are. Whether you're at a 
  <span className="text-white"> College Campus</span>, a 
  <span className="text-white"> Tech Park</span>, or a 
  <span className="text-white"> Music Concert</span>, find active chat rooms within 
  <span className="text-ghost-green"> 500m to 3km</span> of your current location.
</p>
        </div>

        {/* Action Button: CTA */}
        <button
          onClick={onEnter}
          className="group relative mt-2 px-10 py-4 md:px-14 md:py-5 w-[90%] max-w-[260px] md:max-w-xs bg-ghost-green text-primary-foreground font-mono font-black text-xs md:text-sm tracking-[0.25em] uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-ghost-green/40"
        >
          INITIALIZE RADAR
        </button>
      </div>

      {/* --- Professional Feature Grid: The Core Architecture --- */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-full max-w-6xl mt-12 mb-4">
        
        <FeatureItem 
          icon={<Lock className="w-4 h-4 md:w-5 md:h-5" />} 
          title="AES-256" 
          desc="E2E Client Encryption" 
        />
        
        <FeatureItem 
          icon={<EyeOff className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Whisper" 
          desc="Targeted Stealth Chat" 
        />
        
        <FeatureItem 
          icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Nuke" 
          desc="Instant Data Purge" 
        />
        
        <FeatureItem 
          icon={<Shield className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Zero-Log" 
          desc="Untraceable Identity" 
        />
        
        <FeatureItem 
          icon={<MessageSquare className="w-4 h-4 md:w-5 md:h-5" />} 
          title="Pulse" 
          desc="Real-time Memory Sockets" 
        />
        
        <FeatureItem 
          icon={<MapPin className="w-4 h-4 md:w-5 md:h-5" />} 
          title="3KM Grid" 
          desc="Hyperlocal Discovery" 
        />

      </div>

      {/* Footer Status */}
      <footer className="w-full opacity-30 text-center pb-2">
         <p className="text-[7px] md:text-[9px] font-mono uppercase tracking-[0.4em]">
           Warning: Signals are volatile and auto-destruct on exit.
         </p>
      </footer>
    </div>
  );
}

// --- Reusable Feature Component ---
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center p-3 md:p-5 border border-ghost-green/10 rounded-xl bg-ghost-surface/10 backdrop-blur-xl hover:border-ghost-green/40 transition-all duration-300 group">
      <div className="text-ghost-green/60 group-hover:text-ghost-green transition-colors">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[9px] md:text-[11px] uppercase tracking-tighter md:tracking-widest font-black text-white/90">
          {title}
        </h3>
        <p className="hidden md:block text-[8px] text-muted-foreground uppercase leading-tight font-medium opacity-60 group-hover:opacity-100 transition-opacity">
          {desc}
        </p>
      </div>
    </div>
  );
}