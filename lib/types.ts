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
