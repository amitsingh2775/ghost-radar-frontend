"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"], // Strictly websocket use karein stability ke liye
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10, 
      reconnectionDelay: 1000,
      timeout: 60000, // 60 seconds timeout
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};