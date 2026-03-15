"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shield, Send, Eye, LogOut, Mic, Square, Trash2, Play } from "lucide-react";
import { ChatBubble } from "./chat-bubble";
import { CountdownTimer } from "./countdown-timer";
import { AdminSidebar } from "./admin-sidebar";
import type { JoinRequest, RoomUser } from "@/lib/types";
import { VOICE_EFFECTS } from "@/lib/raw";

export function ChatScreen({
  socket, roomId, roomName, isAdmin, messages, joinRequests, roomUsers,
  typingUsers,
  timerEnd, userAlias, onSendMessage, onHeatMessage,
  onRevealWhisper, onApproveUser, onRejectUser, onExileUser, onNuke, onExit, onTyping, onVoiceExpire,
}: any) {
  const [input, setInput] = useState("");
  const [isWhisper, setIsWhisper] = useState(false);
  const [whisperTarget, setWhisperTarget] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestToast, setRequestToast] = useState<JoinRequest | null>(null);

  // Voice States
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [pendingAudioBlob, setPendingAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState("original");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const previewAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (isAdmin && joinRequests && joinRequests.length > 0) {
      const latest = joinRequests[joinRequests.length - 1];
      setRequestToast(latest);
      const timer = setTimeout(() => setRequestToast(null), 5000);
      return () => clearTimeout(timer);
    } else {
      setRequestToast(null);
    }
  }, [isAdmin, joinRequests]);

  const forceCleanup = useCallback(async () => {
    if (previewAudioCtxRef.current) {
      await previewAudioCtxRef.current.close().catch(() => {});
      previewAudioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await forceCleanup();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32000 });

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        if (blob.size > 1000) {
          setPendingAudioBlob(blob);
          setVoicePreviewUrl(URL.createObjectURL(blob));
        }
        setRecordingTime(0);
      };

      recorder.start();
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => (prev >= 19 ? (stopRecording(), 20) : prev + 1));
      }, 1000);
    } catch (err) {
      console.error("Mic failed:", err);
    }
  }, [stopRecording, forceCleanup]);

  const playMorphedPreview = async () => {
    if (!pendingAudioBlob || isPreviewPlaying) return;
    try {
      setIsPreviewPlaying(true);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      previewAudioCtxRef.current = audioCtx;

      const arrayBuffer = await pendingAudioBlob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      if (selectedEffect === "ghost") source.detune.value = -800;
      else if (selectedEffect === "alien") source.detune.value = 1000;
      else if (selectedEffect === "robot") {
        const filter = audioCtx.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = 1500;
        source.connect(filter);
        filter.connect(audioCtx.destination);
      } else source.connect(audioCtx.destination);

      if (selectedEffect !== "robot") source.connect(audioCtx.destination);
      source.onended = () => setIsPreviewPlaying(false);
      source.start(0);
    } catch (err) {
      setIsPreviewPlaying(false);
    }
  };

  useEffect(() => {
    const micBtn = micButtonRef.current;
    if (!micBtn) return;
    const handleTouchStart = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); startRecording(); };
    const handleTouchEnd = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); stopRecording(); };
    micBtn.addEventListener("touchstart", handleTouchStart, { passive: false });
    micBtn.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      micBtn.removeEventListener("touchstart", handleTouchStart);
      micBtn.removeEventListener("touchend", handleTouchEnd);
      forceCleanup();
    };
  }, [startRecording, stopRecording, forceCleanup]);

  const confirmSendVoice = async () => {
    if (!pendingAudioBlob) return;
    if (isWhisper && !whisperTarget) {
        alert("Please select a target first!");
        return;
    }

    try {
      const buffer = await pendingAudioBlob.arrayBuffer();
      socket.emit("send_voice", {
        roomId, chunk: buffer, alias: userAlias, senderAlias: userAlias,
        isWhisper, whisperTarget, effect: selectedEffect,
      });
      cancelVoicePreview();
      setIsWhisper(false);
      setWhisperTarget(null);
    } catch (err) { console.error("Dispatch Failed", err); }
  };

  const cancelVoicePreview = () => {
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    setVoicePreviewUrl(null);
    setPendingAudioBlob(null);
    setSelectedEffect("original");
    if (previewAudioCtxRef.current) {
        previewAudioCtxRef.current.close().catch(() => {});
        previewAudioCtxRef.current = null;
    }
  };

  const handleSend = useCallback(() => {
    if (!input.trim() || (isWhisper && !whisperTarget)) return;
    onSendMessage(input.trim(), isWhisper, whisperTarget);
    setInput("");
    setIsWhisper(false);
    setWhisperTarget(null);
  }, [input, isWhisper, whisperTarget, onSendMessage]);

  return (
    <div className="relative h-[100dvh] flex flex-col bg-ghost-deep overflow-hidden font-mono text-xs sm:text-sm">
      
      {requestToast && isAdmin && (
        <div className="absolute top-14 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="glass rounded-lg p-3 flex items-center justify-between border border-ghost-green/40 bg-ghost-surface/95 backdrop-blur-xl shadow-lg">
             <div className="flex flex-col">
              <span className="text-[10px] text-ghost-green uppercase tracking-widest">Incoming Request</span>
              <span className="text-xs font-bold">{requestToast.alias}</span>
            </div>
            <button 
              onClick={() => { onApproveUser(requestToast.socketId); setRequestToast(null); }} 
              className="px-4 py-1.5 bg-ghost-green text-black text-[10px] font-bold rounded-md active:scale-95 transition-transform"
            >
              accept
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border bg-ghost-surface/80 backdrop-blur-sm z-20">
        <div className="flex-1 overflow-hidden truncate">
          <span className="text-[10px] text-muted-foreground uppercase">{roomName || "Neural Pulse"}</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 shrink-0">
          {timerEnd && <CountdownTimer endTime={timerEnd} onExpired={onNuke} />}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button onClick={isAdmin ? () => setSidebarOpen(true) : onExit} className="p-2 border border-border rounded-md hover:bg-white/5 transition-all">
            {isAdmin ? <Shield className="w-4 h-4 text-ghost-green" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* CHAT FEED */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 scrollbar-hide">
        <div className="flex flex-col gap-4 min-h-full">
          {messages.map((msg: any) => (
              <ChatBubble key={msg.id} 
              message={msg} 
              isOwn={msg.senderAlias === userAlias}
              isTargetUser={msg.whisperTarget === userAlias || msg.senderAlias === userAlias}
              currentUserAlias={userAlias}
              onHeat={onHeatMessage} 
              onReveal={() => onRevealWhisper(msg.id)} 
              onExpire={onVoiceExpire} />
          ))}
          <div ref={messagesEndRef} className="h-4 w-full" />
        </div>
      </main>

      {/* TYPING INDICATOR */}
      {Object.keys(typingUsers || {}).length > 0 && (
        <div className="px-6 py-2 animate-pulse flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-ghost-green shadow-[0_0_8px_#00ff41]" />
          <span className="text-[10px] font-mono text-ghost-green/60 uppercase tracking-widest">
            {Object.keys(typingUsers).length === 1 
              ? `${Object.values(typingUsers)[0]} is typing...` 
              : `${Object.keys(typingUsers).length} messages typing...`}
          </span>
        </div>
      )}

      {/* VOICE PREVIEW */}
      {voicePreviewUrl && (
        <div className="px-3 py-3 border-t border-border bg-ghost-surface/95 animate-in slide-in-from-bottom-2 z-40 space-y-3 pb-safe">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
            <span className="text-[10px] text-ghost-green font-bold uppercase whitespace-nowrap opacity-70">Aura:</span>
            {VOICE_EFFECTS.map((eff) => (
              <button key={eff.id} onClick={() => setSelectedEffect(eff.id)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap active:scale-95 ${selectedEffect === eff.id ? "bg-ghost-green text-black border-ghost-green shadow-[0_0_10px_rgba(0,255,65,0.3)]" : "border-border text-muted-foreground hover:border-ghost-green/40"}`}>
                {eff.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-ghost-deep p-2 rounded-xl border border-ghost-green/20 shadow-2xl">
            <button onClick={playMorphedPreview} disabled={isPreviewPlaying} className={`p-3 rounded-full transition-all ${isPreviewPlaying ? "bg-ghost-green/10 text-ghost-green/40" : "bg-ghost-green/20 text-ghost-green hover:bg-ghost-green/30"}`}><Play className={`w-5 h-5 ${isPreviewPlaying ? "animate-pulse" : "fill-current"}`} /></button>
            <div className="flex-1 flex flex-col"><span className="text-[10px] text-ghost-green font-bold uppercase tracking-widest">{isPreviewPlaying ? "Audio Playing..." : `Ready: ${selectedEffect} Aura`}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={confirmSendVoice} className="p-2.5 bg-ghost-green text-black rounded-lg active:scale-90 shadow-lg"><Send className="w-4 h-4" /></button>
              <button onClick={cancelVoicePreview} className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg active:scale-90"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT CONTROLS + WHISPER UI */}
      <div className="px-3 sm:px-6 py-3 border-t border-border bg-ghost-surface/90 backdrop-blur-md z-30 pb-safe">
        {isWhisper && (
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto no-scrollbar py-2 mb-2 animate-in fade-in">
            {roomUsers.filter((u: RoomUser) => u.alias !== userAlias).map((user: RoomUser) => (
              <button 
                key={user.socketId} 
                onClick={() => setWhisperTarget(user.alias)} 
                className={`px-3 py-1 rounded-md border text-[10px] transition-all ${whisperTarget === user.alias ? "bg-ghost-gold text-black border-ghost-gold shadow-md" : "text-ghost-gold border-ghost-gold/30"}`}
              >
                {user.alias}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => { setIsWhisper(!isWhisper); setWhisperTarget(null); }} className={`p-2.5 rounded-md border transition-all shrink-0 ${isWhisper ? "border-ghost-gold text-ghost-gold bg-ghost-gold/5" : "border-border text-muted-foreground"}`}><Eye className="w-5 h-5" /></button>
          <button ref={micButtonRef} onMouseDown={(e) => { e.preventDefault(); startRecording(); }} onMouseUp={(e) => { e.preventDefault(); stopRecording(); }} onMouseLeave={() => isRecording && stopRecording()} className={`p-2.5 rounded-md border transition-all shrink-0 ${isRecording ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-border text-ghost-green hover:bg-ghost-green/10"}`}><Mic className="w-5 h-5" /></button>
          
          <input 
            type="text" 
            value={input} 
            onChange={(e) => { setInput(e.target.value); onTyping(); }} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
            disabled={isRecording || !!voicePreviewUrl || (isWhisper && !whisperTarget)} 
            placeholder={isRecording ? "Recording..." : (isWhisper && !whisperTarget ? "Select a signal target..." : "Write message...")} 
            
            className={`flex-1 px-4 py-2.5 rounded-md bg-ghost-deep border outline-none text-base sm:text-xs transition-all placeholder:opacity-50 ${
              isRecording 
                ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                : "border-border focus:border-ghost-green/40"
            }`} 
          />
          
          <button onClick={handleSend} disabled={!input.trim() || (isWhisper && !whisperTarget) || isRecording} className={`p-2.5 rounded-md transition-all shrink-0 ${isWhisper ? "bg-ghost-gold text-black shadow-lg" : "bg-ghost-green text-white"} disabled:opacity-30`}><Send className="w-5 h-5" /></button>
        </div>
      </div>
      {isAdmin && <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} joinRequests={joinRequests} roomUsers={roomUsers} onApprove={onApproveUser} onReject={onRejectUser} onExile={onExileUser} onNuke={onNuke} />}
    </div>
  );
}