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

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "heat" | "revealed" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: Math.random().toString(36).substring(2, 9),
        heat: 0,
        revealed: false,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const heatMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, heat: m.heat + 1 } : m
      )
    );
  }, []);

  const revealWhisper = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, revealed: true } : m
      )
    );
  }, []);

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
  }, []);

  return {
    view, setView,
    rooms, setRooms,
    currentRoom, setCurrentRoom,
    isAdmin, setIsAdmin,
    messages, setMessages,
    joinRequests, setJoinRequests,
    roomUsers, setRoomUsers,
    typingPulse, showTypingPulse,
    roomName, setRoomName,
    userAlias, setUserAlias,
    timerEnd, setTimerEnd,
    nukeFlash, setNukeFlash,
    terminated, setTerminated,
    addMessage, heatMessage, revealWhisper,
    resetRoom,
  };
}
