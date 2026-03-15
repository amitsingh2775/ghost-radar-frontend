  import type { Socket } from "socket.io-client";

  export interface Room {
    id: string;
    name: string;
    dist: number;
    heat: number;
  }

  export interface ChatMessage {
    id: string;
    sender: string;
    message: string;
    alias: string;
    isWhisper: boolean;
    whisperTarget?: string | null;
    heat: number;
    revealed: boolean;
    timestamp: number;
  }

  export interface JoinRequest {
    socketId: string;
    alias: string;
  }

  export interface RoomUser {
    socketId: string;
    alias: string;
    joinedAt: number;
  }

  export type AppView = "radar" | "create" | "waiting" | "chat" | "banned" | "terminated";


  export interface ChatScreenProps {
    socket: Socket;
    roomId: string;
    roomName: string;
    isAdmin: boolean;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    joinRequests: JoinRequest[];
    roomUsers: RoomUser[];
    typingPulse: boolean;
    timerEnd: number | null;
    userAlias: string | null;
    onSendMessage: (message: string, isWhisper: boolean, whisperTarget?: string | null) => void;
    onHeatMessage: (messageId: string) => void;
    onRevealWhisper: (messageId: string) => void;
    onApproveUser: (socketId: string) => void;
    onRejectUser: (socketId: string) => void;
    onExileUser: (socketId: string) => void;
    onNuke: () => void;
    onExit: () => void;
    onTimerExpired: () => void;
    onTyping: () => void;
  }
