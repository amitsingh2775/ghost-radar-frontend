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
  
  // Now an object to hold the list and the Redis count
  const [roomUsers, setRoomUsers] = useState<{ 
    users: RoomUser[], 
    onlineCount: number 
  }>({ users: [], onlineCount: 0 });
  
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const [roomName, setRoomName] = useState("");
  const [userAlias, setUserAlias] = useState("");
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [nukeFlash, setNukeFlash] = useState(false);
  const [terminated, setTerminated] = useState(false);

  const showTypingPulse = useCallback((socketId: string, alias: string) => {
    setTypingUsers((prev) => ({ ...prev, [socketId]: alias }));
    if (typingTimeouts.current[socketId]) clearTimeout(typingTimeouts.current[socketId]);
    typingTimeouts.current[socketId] = setTimeout(() => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      delete typingTimeouts.current[socketId];
    }, 3000);
  }, []);

  const updateMessageHeat = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, heat: (m.heat || 0) + 1 } : m));
  }, []);

  const resetRoom = useCallback(() => {
    setCurrentRoom(null);
    setIsAdmin(false);
    setMessages([]);
    setJoinRequests([]);
    setRoomUsers({ users: [], onlineCount: 0 }); // // updated reset
    setTimerEnd(null);
    setRoomName("");
    setTypingUsers({}); 
  }, []);

  const revealWhisper = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, revealed: true } : m));
  }, []);

  return {
    view, setView, rooms, setRooms, currentRoom, setCurrentRoom,
    isAdmin, setIsAdmin, messages, setMessages, joinRequests, setJoinRequests,
    roomUsers, setRoomUsers, typingUsers, showTypingPulse, updateMessageHeat, 
    roomName, setRoomName, userAlias, setUserAlias, timerEnd, setTimerEnd,
    nukeFlash, setNukeFlash, terminated, setTerminated, revealWhisper, resetRoom,
  };
}