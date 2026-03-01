"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shield, Send, Eye, UserCheck, LogOut } from "lucide-react";
import { ChatBubble } from "./chat-bubble";
import { CountdownTimer } from "./countdown-timer";
import { AdminSidebar } from "./admin-sidebar";
import type { ChatMessage, JoinRequest, RoomUser, ChatScreenProps } from "@/lib/types";

export function ChatScreen({
  socket,
  roomId,
  roomName,
  isAdmin,
  messages,
  joinRequests,
  roomUsers,
  typingPulse,
  timerEnd,
  userAlias,
  onSendMessage,
  onHeatMessage,
  onRevealWhisper,
  onApproveUser,
  onRejectUser,
  onExileUser,
  onNuke,
  onExit,
  onTyping,
}: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [isWhisper, setIsWhisper] = useState(false);
  const [whisperTarget, setWhisperTarget] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestToast, setRequestToast] = useState<JoinRequest | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingPulse]);

  useEffect(() => {
    if (isAdmin && joinRequests.length > 0) {
      setRequestToast(joinRequests[joinRequests.length - 1]);
      const timer = setTimeout(() => setRequestToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, joinRequests]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSendMessage(input.trim(), isWhisper, whisperTarget);
    setInput("");
    setIsWhisper(false);
    setWhisperTarget(null);
  }, [input, isWhisper, whisperTarget, onSendMessage]);

  return (
    <div className="relative h-[100dvh] flex flex-col bg-ghost-deep overflow-hidden font-mono text-xs sm:text-sm">
      {/* Admin Toast logic wahi rahegi */}
      {requestToast && isAdmin && (
        <div className="absolute top-12 left-2 right-2 z-50 animate-float-up">
          <div className="glass rounded-lg p-2 flex items-center justify-between border border-ghost-green/30 bg-ghost-surface/95 backdrop-blur-md">
             <span className="text-[10px] truncate uppercase pr-2">Req: <span className="text-ghost-green">{requestToast.alias}</span></span>
             <button onClick={() => { onApproveUser(requestToast.socketId); setRequestToast(null); }} className="text-[9px] text-ghost-green border border-ghost-green/30 px-2 py-1 rounded font-bold">ALLOW</button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-ghost-surface/80 backdrop-blur-sm z-20">
        <div className="flex-1 overflow-hidden">
          <span className="text-[9px] text-muted-foreground uppercase truncate block max-w-[80px] sm:max-w-[200px]">
            {roomName || "Neural Signal"}
          </span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 shrink-0">
          {timerEnd && <CountdownTimer endTime={timerEnd} onExpired={onNuke} />}
        </div>

        {/* 🔥 Mobile Optimization for Exit Button */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {!isAdmin ? (
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-ghost-grey/30 text-muted-foreground hover:text-white transition-all bg-ghost-deep/50"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline text-[9px]">ABDUCT</span>
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-ghost-green/30 text-ghost-green hover:bg-ghost-green/10 transition-all bg-ghost-deep/50"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline text-[9px]">PROTECT</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-2 sm:px-4 py-3 scroll-smooth scrollbar-hide">
        <div className="flex flex-col gap-3 min-h-full">
          {messages.map((msg: ChatMessage) => {
            const isSender = msg.sender === socket.id;
            const isTarget = msg.whisperTarget === socket.id;
            const canSee = !msg.isWhisper || isSender || isTarget;
            if (!canSee) return null;

            return (
              <ChatBubble
                key={msg.id}
                message={msg}
                isOwn={isSender}
                isTargetUser={isTarget}
                onHeat={onHeatMessage}
                onReveal={() => onRevealWhisper(msg.id)}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-4 w-full" />
        </div>
      </main>

      {/* Input section remains optimized */}
      <div className="px-2 sm:px-4 py-2 border-t border-border bg-ghost-surface/90 backdrop-blur-md z-30 space-y-2 pb-safe">
        {isWhisper && (
          <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar max-h-24 animate-in fade-in slide-in-from-bottom-2">
            <p className="w-full text-[9px] uppercase tracking-widest text-ghost-gold mb-1">Target shadow:</p>
            {roomUsers.filter((u: RoomUser) => u.alias !== userAlias).map((user: RoomUser) => (
                <button key={user.socketId} onClick={() => setWhisperTarget(user.socketId)} className={`px-2 py-1 rounded border text-[9px] ${whisperTarget === user.socketId ? "bg-ghost-gold text-black border-ghost-gold" : "text-ghost-gold border-ghost-gold/30"}`}>{user.alias}</button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => { setIsWhisper(!isWhisper); setWhisperTarget(null); }} className={`p-2 rounded-md border transition-all ${isWhisper ? "border-ghost-gold text-ghost-gold" : "border-border text-muted-foreground"}`}><Eye className="w-4 h-4" /></button>
          <input type="text" value={input} onChange={(e) => { setInput(e.target.value); onTyping(); }} onKeyDown={(e) => e.key === "Enter" && handleSend()} disabled={isWhisper && !whisperTarget} placeholder={isWhisper ? (whisperTarget ? "Private frequency..." : "Target shadow") : "Send frequency..."} className={`flex-1 px-3 py-2 rounded-md bg-ghost-deep border outline-none text-[11px] transition-all min-w-0 ${isWhisper ? "border-ghost-gold/40 text-ghost-gold" : "border-border text-foreground focus:border-ghost-green/40"}`} />
          <button onClick={handleSend} disabled={!input.trim() || (isWhisper && !whisperTarget)} className={`p-2 rounded-md ${isWhisper ? "bg-ghost-gold text-black" : "bg-ghost-green text-white"} shrink-0`}><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {isAdmin && <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} joinRequests={joinRequests} roomUsers={roomUsers} onApprove={onApproveUser} onReject={onRejectUser} onExile={onExileUser} onNuke={onNuke} />}
    </div>
  );
}