"use client";

import { useState } from "react";
import { Flame, ShieldAlert, Lock } from "lucide-react";

export function ChatBubble({ message, isOwn, onHeat, onReveal, isTargetUser }: any) {
  const [hasHeated, setHasHeated] = useState(false);
  
  const isHot = message.heat >= 5;
  const isWhisper = message.isWhisper;

  // Logic FIX: hidden tabhi hoga jab whisper ho, aap target ho, aur isRevealed explicitly false ho
  const hidden = isWhisper && isTargetUser && (message.isRevealed === false || message.isRevealed === undefined);

  const handleDoubleClick = () => {
    if (hidden) {
      // Trigger reveal in parent store/state
      onReveal(message.id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-float-up w-full`}>
      <div className="max-w-[75%] flex flex-col gap-1">

        {!isOwn && (
          <span className="text-[10px] font-mono text-ghost-green/80 ml-1 uppercase tracking-tighter">
            {message.alias || "Shadow"}
          </span>
        )}

        {isWhisper && (
          <div className={`flex items-center gap-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <ShieldAlert className="w-2.5 h-2.5 text-ghost-gold" />
            <span className="text-[8px] font-mono text-ghost-gold uppercase">
              {isOwn ? "Sent Whisper" : "Targeted Whisper"}
            </span>
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
            ${hidden ? "blur-md opacity-30 bg-ghost-gold/5 border-ghost-gold/20" : "blur-0 opacity-100"}
            ${isHot ? "shadow-[0_0_15px_rgba(255,215,0,0.3)] border-ghost-gold" : ""}
          `}
        >
          <p className="break-words flex items-center gap-2">
            {hidden && <Lock className="w-3 h-3 text-ghost-gold shrink-0" />}
            {hidden ? "SIGNAL_ENCRYPTED_DOUBLE_TAP" : message.message}
          </p>
        </div>

        <div className={`flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"} px-1`}>
          <button
            onClick={() => {
              if (!hasHeated) {
                setHasHeated(true);
                onHeat(message.id);
              }
            }}
            className={`flex items-center gap-0.5 text-[10px] transition-colors ${
              isHot || hasHeated ? "text-ghost-gold" : "text-muted-foreground hover:text-ghost-gold"
            }`}
          >
            <Flame className={`w-3 h-3 ${isHot || hasHeated ? "fill-ghost-gold" : ""}`} />
            {message.heat > 0 && <span>{message.heat}</span>}
          </button>

          <span className="text-[8px] text-muted-foreground/40 ml-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}