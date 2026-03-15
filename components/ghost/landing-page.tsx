"use client";
import Image from "next/image";
import { Shield, Zap, Lock, EyeOff, MessageSquare, MapPin } from "lucide-react";

// Props interface with isStatic
interface LandingPageProps {
  onEnter: () => void;
  isStatic?: boolean;
}

export function LandingPage({ onEnter, isStatic = false }: LandingPageProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-between grid-bg px-4 py-8 md:px-6 md:py-12 overflow-hidden bg-[#0D0D0D] ${isStatic ? 'pointer-events-none' : ''}`}>
      
      {/* --- Top Bar --- */}
      <div className="w-full max-w-7xl flex justify-between items-center opacity-50 px-2">
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-ghost-green animate-pulse" />
          <span className="text-[7px] sm:text-[10px] tracking-[0.3em] uppercase font-mono text-ghost-green">
            Protocol: Neural_Pulse_Active
          </span>
        </div>
        <span className="text-[7px] sm:text-[10px] tracking-[0.3em] uppercase font-mono text-white/40 font-bold">
          v1.0.4_SECURED
        </span>
      </div>

      {/* --- Main Hero Section --- */}
      <div className="flex flex-col items-center text-center gap-6 sm:gap-10 w-full flex-grow justify-center py-10">
        
        <div className="relative group cursor-pointer" onClick={onEnter}>
          <div className="relative p-4 sm:p-6 rounded-full bg-ghost-surface border border-ghost-green/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] group-hover:border-ghost-green/50 transition-all duration-700">
            <Image 
              src="/icon-512x512.webp" 
              alt="Ghost-Radar: Best Anonymous Local Chat App" 
              width={140} 
              height={140} 
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              priority 
            />
          </div>
        </div>

        <div className="space-y-4 px-2 sm:px-6">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-mono font-black tracking-tighter uppercase italic leading-none text-white">
            Ghost <span className="text-ghost-green text-shadow-glow">Radar</span>
          </h1>
          
          <div className="max-w-[280px] sm:max-w-md md:max-w-2xl mx-auto space-y-4">
            <h2 className="text-ghost-green font-bold text-[10px] sm:text-xs md:text-lg uppercase tracking-[0.2em]">
              Anonymous Local Chat & Stealth Messaging
            </h2>
            <p className="text-[10px] sm:text-xs md:text-base text-muted-foreground/80 font-mono tracking-wide leading-relaxed">
              Connect with people around you without revealing your identity. 
              <span className="text-white block mt-1 sm:inline sm:ml-1 font-bold">
                Bina identity bataye aas-pass ke logo se chat karein.
              </span>
              <br className="hidden md:block" />
              Secure messaging for <span className="text-white">Colleges</span> & <span className="text-white">Tech Parks</span> within <span className="text-ghost-green font-bold">3KM Range.</span>
            </p>
          </div>
        </div>

     
        {!isStatic ? (
          <button
            onClick={onEnter}
            className="group relative mt-4 px-8 py-4 sm:px-14 sm:py-5 w-full max-w-[240px] sm:max-w-xs bg-ghost-green text-[#0D0D0D] font-mono font-black text-xs md:text-sm tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-ghost-green/40 overflow-hidden"
          >
            <span className="relative z-10">START CHATTING</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        ) : (
          <div className="h-[52px] sm:h-[60px]" />
        )}
      </div>

  
      <div className="w-full max-w-6xl mt-6 sm:mt-12">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
          <FeatureItem icon={<Lock className="w-4 h-4 md:w-5 md:h-5" />} title="Secure" desc="E2EE Protection" />
          <FeatureItem icon={<EyeOff className="w-4 h-4 md:w-5 md:h-5" />} title="Secret" desc="Stealth Mode" />
          <FeatureItem icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} title="Fast" desc="Instant Sync" />
          <FeatureItem icon={<Shield className="w-4 h-4 md:w-5 md:h-5" />} title="Private" desc="Zero Log" />
          <FeatureItem icon={<MessageSquare className="w-4 h-4 md:w-5 md:h-5" />} title="Local" desc="Nearby Signal" />
          <FeatureItem icon={<MapPin className="w-4 h-4 md:w-5 md:h-5" />} title="3KM" desc="Range Grid" />
        </div>
      </div>

      <footer className="w-full opacity-30 text-center pt-8 pb-4">
          <p className="text-[6px] sm:text-[9px] font-mono uppercase tracking-[0.4em] px-4 leading-relaxed">
            Encrypted signals detected in your vicinity. Secure connection established.
          </p>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center p-3 sm:p-5 border border-ghost-green/10 rounded-xl bg-ghost-surface/10 backdrop-blur-xl group hover:border-ghost-green/40 transition-all duration-300">
      <div className="text-ghost-green/60 group-hover:text-ghost-green transition-colors">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <h3 className="text-[8px] sm:text-[10px] md:text-[11px] uppercase tracking-tighter font-black text-white/90">
          {title}
        </h3>
        <p className="hidden sm:block text-[7px] md:text-[8px] text-muted-foreground uppercase opacity-40 group-hover:opacity-100 transition-opacity">
          {desc}
        </p>
      </div>
    </div>
  );
}