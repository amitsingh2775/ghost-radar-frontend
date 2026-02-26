"use client";

import { useState } from "react";
import { Flame, ShieldAlert } from "lucide-react";

export function ChatBubble({ message, isOwn, onHeat, onReveal }: any) {
  const [hasHeated, setHasHeated] = useState(false);
  const isHot = message.heat >= 5;
  const isWhisper = message.isWhisper;

  const handleDoubleClick = () => {
    if (isWhisper && !message.isRevealed) {
      onReveal(message.id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-float-up w-full`}>
      <div className="max-w-[75%] flex flex-col gap-1">
        
        {/* 🔥 FIX: Display User Alias above the message (WhatsApp Style) */}
        {!isOwn && (
          <span className="text-[10px] font-mono text-ghost-green/80 ml-1 uppercase tracking-tighter">
            {message.alias || "Shadow"}
          </span>
        )}

        {isWhisper && (
          <div className={`flex items-center gap-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <ShieldAlert className="w-2.5 h-2.5 text-ghost-gold" />
            <span className="text-[8px] font-mono text-ghost-gold uppercase">Targeted Whisper</span>
          </div>
        )}

        <div
          onDoubleClick={handleDoubleClick}
          className={`
            relative px-3 py-2 rounded-lg font-mono text-sm transition-all duration-500 cursor-pointer select-none
            ${isOwn
              ? "bg-ghost-green/10 text-ghost-green border border-ghost-green/20 rounded-tr-none"
              : "bg-ghost-surface text-foreground border border-border rounded-tl-none"
            }
            ${isWhisper && !message.isRevealed ? "blur-md opacity-30 bg-ghost-gold/5 border-ghost-gold/20" : ""} 
            ${isHot ? "shadow-[0_0_15px_rgba(255,215,0,0.3)] border-ghost-gold" : ""} 
          `}
        >
          <p className="break-words">
            {isWhisper && !message.isRevealed ? "SIGNAL_ENCRYPTED_DOUBLE_TAP" : message.message}
          </p>
        </div>

        {/* Heat Button Logic */}
        <div className={`flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"} px-1`}>
          <button 
            onClick={() => { if(!hasHeated){ setHasHeated(true); onHeat(message.id); } }} 
            className={`flex items-center gap-0.5 text-[10px] transition-colors ${isHot || hasHeated ? "text-ghost-gold" : "text-muted-foreground hover:text-ghost-gold"}`}
          >
            <Flame className={`w-3 h-3 ${isHot || hasHeated ? "fill-ghost-gold" : ""}`} />
            {message.heat > 0 && <span>{message.heat}</span>}
          </button>
          
          {/* Optional: Add timestamp */}
          <span className="text-[8px] text-muted-foreground/40 ml-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}