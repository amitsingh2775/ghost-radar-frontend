"use client";

import { useCallback, useRef, useState } from "react";
import type { AppView, ChatMessage, JoinRequest, Room, RoomUser } from "@/lib/types";

export function useGhostStore() {
  const [view, setView] = useState<AppView>("radar");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [typingPulse, setTypingPulse] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [userAlias, setUserAlias] = useState("");
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [nukeFlash, setNukeFlash] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔥 Helper to update typing state
  const showTypingPulse = useCallback(() => {
    setTypingPulse(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTypingPulse(false), 2000);
  }, []);

  const resetRoom = useCallback(() => {
    setCurrentRoom(null);
    setIsAdmin(false);
    setMessages([]);
    setJoinRequests([]);
    setRoomUsers([]);
    setTimerEnd(null);
    setRoomName("");
    setTypingPulse(false);
  }, []);

  const revealWhisper = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, revealed: true } : m
      )
    );
  }, []);

  return {
    view, setView,
    rooms, setRooms,
    currentRoom, setCurrentRoom,
    isAdmin, setIsAdmin,
    messages, setMessages,
    joinRequests, setJoinRequests,
    roomUsers, setRoomUsers,
    typingPulse, setTypingPulse, 
    showTypingPulse,
    roomName, setRoomName,
    userAlias, setUserAlias,
    timerEnd, setTimerEnd,
    nukeFlash, setNukeFlash,
    terminated, setTerminated,
    revealWhisper,
    resetRoom,
  };
}