"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Play, Pause, Square, ShieldAlert, Ghost } from "lucide-react";
import { getAudio, deleteAudio } from "@/lib/db";

export function ChatBubble({ message, isOwn, onHeat, onReveal, isTargetUser, currentUserAlias, onExpire }: any) {
  const [showLol, setShowLol] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(message.voiceData);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  
 
  const isWhisper = !!message.isWhisper;


  const canAccess = !isWhisper || isOwn || isTargetUser;
  
  //  isOpened update - unauthorized people should see it as Locked, not Opened
  const isOpened = message.isExpired || (message.isVoice && !isOwn && canAccess && !blobUrl && message.playedOnce);
  const isLockedBlur = isWhisper && !canAccess;

  useEffect(() => {
    let active = true;
    // Recover audio ONLY if access is granted and message isn't expired
    if (message.isVoice && !message.isExpired && !blobUrl && canAccess) {
      const recoverAudio = async () => {
        const blob = await getAudio(message.id);
        if (blob && active) setBlobUrl(URL.createObjectURL(blob));
      };
      recoverAudio();
    }
    return () => { active = false; };
  }, [message.id, message.isVoice, message.isExpired, blobUrl, canAccess]);

  const handleAudioEnded = async () => {
    setIsPlaying(false);
    if (!isOwn && blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      await deleteAudio(message.id);
      if (onExpire) onExpire(message.id);
    }
  };

  const togglePlay = async () => {
    if (isOpened || !blobUrl || isLockedBlur) return;
    if (isPlaying) {
      if (audioContextRef.current) await audioContextRef.current.close();
      setIsPlaying(false); return;
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      audioContextRef.current = audioCtx;
      const response = await fetch(blobUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      const effect = message.effect || "original";
      if (effect === "ghost") source.detune.value = -800;
      else if (effect === "alien") source.detune.value = 1000;
      else if (effect === "robot") {
        const filter = audioCtx.createBiquadFilter();
        filter.type = "peaking"; filter.frequency.value = 1500;
        source.connect(filter); filter.connect(audioCtx.destination);
      } else source.connect(audioCtx.destination);

      if (effect !== "robot") source.connect(audioCtx.destination);
      source.onended = () => handleAudioEnded();
      source.start(0);
      setIsPlaying(true);
    } catch (err) { setIsPlaying(false); }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-float-up w-full`}>
      <div className="max-w-[85%] sm:max-w-[70%] flex flex-col gap-1">
        {!isOwn && (
          <span className="text-[10px] font-mono text-ghost-green/80 ml-1 uppercase tracking-widest flex items-center gap-2">
            {message.alias || "Shadow"}
            {isWhisper && <span className="text-ghost-gold font-bold">[PRIVATE]</span>}
          </span>
        )}

        <div 
          onDoubleClick={() => { if (isLockedBlur) setShowLol(true); }}
          className={`relative px-4 py-3 rounded-2xl border transition-all duration-500 shadow-lg 
            ${isOwn ? "bg-ghost-green/5 text-ghost-green border-ghost-green/30 rounded-tr-none" : "bg-ghost-surface/90 text-foreground border-border rounded-tl-none"} 
            ${isLockedBlur && !showLol ? "blur-xl opacity-20 cursor-help" : "blur-0 opacity-100"} 
            ${isOpened && !isOwn && !isLockedBlur ? "opacity-40 grayscale border-dashed" : ""}`}
        >
          {isLockedBlur && showLol ? (
            <div className="flex items-center gap-2 py-1 animate-in zoom-in-95 duration-300">
               <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
               <span className="text-[11px] font-black text-red-500 uppercase tracking-tighter">
                 LOL,Its not for you! 🤫
               </span>
            </div>
          ) : isLockedBlur && !showLol ? (
            <div className="flex items-center gap-2">
               <Ghost className="w-4 h-4 text-ghost-green/20" />
               <span className="text-[10px] text-transparent select-none">something special for you</span>
            </div>
          ) : message.isVoice ? (
            <div className="flex items-center gap-3 min-w-[180px]">
                <button 
                  onClick={togglePlay}
                  disabled={isOpened || isLockedBlur}
                  className={`p-2.5 rounded-lg transition-all ${isOpened ? "opacity-30" : "hover:bg-ghost-green/10"}`}
                >
                  {isOpened ? (
                    <Square className="w-5 h-5 text-ghost-green/50" strokeWidth={1.5} />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-ghost-green fill-current animate-pulse" />
                  ) : (
                    <Square className="w-5 h-5 text-ghost-green fill-current" />
                  )}
                </button>
                <div className="flex-1">
                   <span className={`text-[10px] font-bold tracking-widest uppercase ${isOpened ? "text-muted-foreground" : "text-ghost-green"}`}>
                     {isOpened ? "OPENED" : isPlaying ? "PLAYING..." : "VOICE MESSAGE"}
                   </span>
                </div>
            </div>
          ) : (
            <p className="break-words flex items-center gap-2 text-sm font-mono">
              {isWhisper && <Lock className="w-3 h-3 text-ghost-gold shrink-0" />}
              {message.message}
            </p>
          )}
        </div>

        {!isLockedBlur && (
          <div className={`flex items-center gap-3 ${isOwn ? "justify-end" : "justify-start"} px-1`}>
            <span className="text-[8px] font-mono text-muted-foreground/50 italic">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}