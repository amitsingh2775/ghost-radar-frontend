"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; 
import CryptoJS from "crypto-js";
import { getSocket } from "@/lib/socket";
import { useGhostStore } from "@/hooks/use-ghost-store";
import { RadarScreen } from "./radar-screen";
import { CreateRoomScreen } from "./create-room-screen";
import { WaitingScreen } from "./waiting-screen";
import { ChatScreen } from "./chat-screen";
import { BannedScreen } from "./banned-screen";
import { NukeOverlay } from "./NukeOverlay";
import { EntryScreen } from "./entry-screen"; 
import { LandingPage } from "./landing-page"; 
import type { Socket } from "socket.io-client";

const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || "ghost-pulse-session";
const IDENTITY_KEY = process.env.NEXT_PUBLIC_IDENTITY_KEY || "ghost-pulse-identity";
const GLOBAL_SALT = process.env.NEXT_PUBLIC_GLOBAL_SALT || "ghost_v1_neural_salt_99";
const ONE_WEEK_MS = Number(process.env.NEXT_PUBLIC_IDENTITY_MS) || 604800000;

export function GhostPulseApp() {
  const store = useGhostStore();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isIdentified, setIsIdentified] = useState(false); 
  const [showLanding, setShowLanding] = useState(true); 
  const [isChecking, setIsChecking] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const roomSecret = useMemo(() => {
    if (!store.currentRoom) return "";
    const cleanId = store.currentRoom.replace("room:", "");
    return CryptoJS.SHA256(cleanId + GLOBAL_SALT).toString();
  }, [store.currentRoom]);

  const updateRoute = useCallback((view: string, roomId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("v", view);
    if (roomId) params.set("r", roomId.replace("room:", ""));
    else params.delete("r");
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const handleReset = useCallback(() => {
    if (store.currentRoom) {
      const cleanId = store.currentRoom.replace("room:", "");
      localStorage.removeItem(`cache_${cleanId}`);
      sessionStorage.removeItem(`cache_${cleanId}`);
    }
    store.resetRoom();
    sessionStorage.removeItem(SESSION_KEY);
    store.setView("radar");
    updateRoute("radar");
  }, [store, updateRoute]);

  const handleExitRoom = useCallback(() => {
    if (socketRef.current && store.currentRoom) {
      socketRef.current.emit("leave_room", { roomId: store.currentRoom });
    }
    handleReset();
  }, [store.currentRoom, handleReset]);

  // 🔥 FIX: Whisper Reveal and Persistence Logic
  const handleRevealWhisper = useCallback((messageId: string) => {
    store.setMessages((prev) => {
      const updated = prev.map((m) => 
        m.id === messageId ? { ...m, isRevealed: true } : m
      );

      // Cache ko update karna taaki refresh par data na jaye
      if (store.currentRoom) {
        const cleanId = store.currentRoom.replace("room:", "");
        const currentSecret = CryptoJS.SHA256(cleanId + GLOBAL_SALT).toString();
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(updated), currentSecret).toString();
        sessionStorage.setItem(`cache_${cleanId}`, encrypted);
      }
      
      return updated;
    });
  }, [store.currentRoom]);

  useEffect(() => {
    const session = loadSession();
    const rawIdentity = localStorage.getItem(IDENTITY_KEY);

    if (rawIdentity) {
      try {
        const { alias, createdAt } = JSON.parse(rawIdentity);
        if (Date.now() - createdAt < ONE_WEEK_MS) {
          store.setUserAlias(alias);
          setIsIdentified(true);
          setShowLanding(false);
        }
      } catch (e) { localStorage.removeItem(IDENTITY_KEY); }
    }

    if (session) {
      const cleanId = session.roomId.replace("room:", "");
      store.setCurrentRoom(cleanId);
      store.setRoomName(session.roomName);
      store.setIsAdmin(session.isAdmin);
      store.setTimerEnd(session.timerEnd);
      store.setView("chat");

      const secret = CryptoJS.SHA256(cleanId + GLOBAL_SALT).toString();
      const cached = sessionStorage.getItem(`cache_${cleanId}`);
      if (cached) {
        try {
          const bytes = CryptoJS.AES.decrypt(cached, secret);
          const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          store.setMessages(decrypted.slice(-20)); 
        } catch (e) {}
      }
    }
    
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      const session = loadSession();
      if (session) {
        socket.emit(session.isAdmin ? "admin_join_room" : "rejoin_room", {
            roomId: session.roomId,
            userAlias: store.userAlias
        });
      }
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err) => {
      if (err.message === "BANNED") {
        store.setView("banned");
        updateRoute("banned");
      }
    });

    socket.on("new_message", (payload: any) => {
      const currentRoomId = (payload.roomId || store.currentRoom || "").replace("room:", ""); 
      if(!currentRoomId) return;
      
      const currentSecret = CryptoJS.SHA256(currentRoomId + GLOBAL_SALT).toString();

      try {
        const bytes = CryptoJS.AES.decrypt(payload.message, currentSecret);
        const text = bytes.toString(CryptoJS.enc.Utf8);
        if (!text) return;

        // Message object mein isRevealed flag handle karna
        const newMessage = { 
          ...payload, 
          message: text,
          isRevealed: payload.isWhisper ? false : true 
        };
        
        store.setMessages((prev) => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          const updated = [...prev, newMessage].slice(-20); 
          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(updated), currentSecret).toString();
          sessionStorage.setItem(`cache_${currentRoomId}`, encrypted);
          return updated;
        });
      } catch (e) { console.error("Decryption failure"); }
    });

    socket.on("access_granted", ({ roomId, roomName, expiresAt }) => {
      const cleanId = roomId.replace("room:", "");
      store.setCurrentRoom(cleanId);
      store.setRoomName(roomName);
      store.setTimerEnd(Number(expiresAt));
      store.setView("chat");
      updateRoute("chat", cleanId);
      saveSession({ roomId: cleanId, roomName, isAdmin: false, timerEnd: Number(expiresAt) });
    });

    socket.on("room_users_update", (users) => store.setRoomUsers(users));
    socket.on("join_request", ({ socketId, alias }) => {
      store.setJoinRequests((prev) => prev.some(r => r.socketId === socketId) ? prev : [...prev, { socketId, alias }]);
    });

    socket.on("GLOBAL_NUKE", () => store.setNukeFlash(true));
    socket.on("ROOM_VANISHED", handleReset);
    socket.on("exiled", handleReset);
    socket.on("display_pulse_dot", () => store.showTypingPulse());

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("access_granted");
      socket.off("room_users_update"); 
      socket.off("new_message");
      socket.off("GLOBAL_NUKE");
      socket.off("ROOM_VANISHED");
      socket.off("exiled");
      socket.off("display_pulse_dot");
    };
  }, [handleReset, updateRoute, store, roomSecret]);

  const handleSendMessage = useCallback((message: string, isWhisper: boolean, whisperTarget?: string | null) => {
    if (!socketRef.current || !roomSecret || !message.trim()) return;
    const encrypted = CryptoJS.AES.encrypt(message, roomSecret).toString();
    socketRef.current.emit("send_message", { 
        roomId: store.currentRoom, 
        message: encrypted, 
        isWhisper, 
        whisperTarget,
        alias: store.userAlias
    });
  }, [store.currentRoom, roomSecret, store.userAlias]);

  const handleApproveUser = useCallback((socketId: string) => {
    socketRef.current?.emit("approve_user", { targetSocketId: socketId, roomId: store.currentRoom });
    store.setJoinRequests((prev) => prev.filter((r) => r.socketId !== socketId));
  }, [store.currentRoom]);

  if (isChecking) return <div className="min-h-screen bg-ghost-deep" />;

  if (store.view === "banned") return <BannedScreen />;

  if (showLanding && !isIdentified) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  if (!isIdentified) {
    return <EntryScreen onIdentify={(name) => {
      const fullAlias = `${name}#${Math.random().toString(16).substring(2, 6)}`;
      localStorage.setItem(IDENTITY_KEY, JSON.stringify({ alias: fullAlias, createdAt: Date.now() }));
      store.setUserAlias(fullAlias);
      setIsIdentified(true);
      store.setView("radar");
      updateRoute("radar");
    }} />;
  }

  if (!connected) return <div className="min-h-screen flex items-center justify-center font-mono text-ghost-green animate-pulse uppercase text-xs tracking-[0.3em]">Syncing Neural Pulse...</div>;

  return (
    <div className="h-[100dvh] overflow-hidden">
      <NukeOverlay active={store.nukeFlash} onComplete={() => { store.setNukeFlash(false); handleReset(); }} />
      {store.view === "chat" && store.currentRoom ? (
        <ChatScreen 
          socket={socketRef.current!} 
          roomId={store.currentRoom} 
          {...store} 
          userAlias={store.userAlias} 
          onSendMessage={handleSendMessage} 
          onHeatMessage={(id) => socketRef.current?.emit("heat_message", { roomId: store.currentRoom, messageId: id })} 
          onRevealWhisper={handleRevealWhisper} // new updated
          onApproveUser={handleApproveUser} 
          onRejectUser={(id) => { socketRef.current?.emit("reject_user", { targetSocketId: id }); store.setJoinRequests(p => p.filter(r => r.socketId !== id)); }} 
          onExileUser={(id) => { socketRef.current?.emit("exile_user", { targetSocketId: id, roomId: store.currentRoom }); store.setRoomUsers(p => p.filter(u => u.socketId !== id)); }} 
          onNuke={() => socketRef.current?.emit("nuke_all", store.currentRoom)} 
          onExit={handleExitRoom} 
          onTimerExpired={() => {}} 
          onTyping={() => socketRef.current?.emit("typing", { roomId: store.currentRoom })} 
        />
      ) : (
        <>
          {store.view === "radar" && <RadarScreen socket={socketRef.current!} rooms={store.rooms} setRooms={store.setRooms} onJoinRoom={(id) => { socketRef.current?.emit("request_join", { roomId: id, userAlias: store.userAlias || "Shadow" }); store.setCurrentRoom(id); store.setView("waiting"); updateRoute("waiting", id); }} onCreateRoom={() => { store.setView("create"); updateRoute("create"); }} />}
          {store.view === "create" && (
            <CreateRoomScreen 
              socket={socketRef.current!} 
              onBack={() => { store.setView("radar"); updateRoute("radar"); }} 
              onCreated={(id, name, exp) => { 
                const cleanId = id.replace("room:", "");
                store.setCurrentRoom(cleanId); store.setRoomName(name); store.setIsAdmin(true); store.setTimerEnd(Number(exp)); store.setView("chat"); 
                updateRoute("chat", cleanId); 
                saveSession({ roomId: cleanId, roomName: name, isAdmin: true, timerEnd: Number(exp) }); 
              }} 
              userAlias={store.userAlias} 
            />
          )}
          {store.view === "waiting" && <WaitingScreen onBack={handleReset} />}
        </>
      )}
    </div>
  );
}

function saveSession(data: any) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {} }
function loadSession(): any {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.timerEnd > Date.now() ? parsed : null;
  } catch { return null; }
}