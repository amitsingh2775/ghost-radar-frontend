"use client";

import { useState } from "react";
import { Ghost, Terminal, ChevronRight } from "lucide-react";

export function EntryScreen({ onIdentify }: { onIdentify: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center grid-bg px-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-ghost-green/10 border border-ghost-green/20">
            <Ghost className="w-10 h-10 text-ghost-green" />
          </div>
          <h1 className="text-xl font-mono font-bold text-foreground tracking-[0.2em] uppercase">
            Initialize <span className="text-ghost-green text-shadow-glow">Alias</span>
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase">
            Persistence: 7 Days | Mode: Stealth
          </p>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); if(name.trim().length >= 2) onIdentify(name.trim()); }} 
          className="space-y-4"
        >
          <div className="relative group">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost-green/50" />
            <input
              type="text" autoFocus maxLength={15} value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shadow name..."
              className="w-full pl-10 pr-4 py-3 rounded-md bg-ghost-surface border border-border text-foreground font-mono text-sm focus:border-ghost-green/50 outline-none transition-all"
            />
          </div>
          <button
            type="submit" disabled={name.trim().length < 2}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-ghost-green text-primary-foreground font-mono text-sm font-bold hover:bg-ghost-green/90 disabled:opacity-20 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <span>CONNECT TO SIGNAL</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}