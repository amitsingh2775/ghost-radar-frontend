"use client";

import { useEffect, useCallback, useState } from "react";
import { Radio, Plus, AlertTriangle, User } from "lucide-react";
import { RoomCard } from "./room-card";
import { RadarBackground } from "./radar-background";
import { useGhostStore } from "@/hooks/use-ghost-store";
import type { Room } from "@/lib/types";
import type { Socket } from "socket.io-client";

interface RadarScreenProps {
  socket: Socket;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

export function RadarScreen({ socket, rooms, setRooms, onJoinRoom, onCreateRoom }: RadarScreenProps) {
  const store = useGhostStore();
  const [scanning, setScanning] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const scanRooms = useCallback(() => {
    if (!coords) return;
    setScanning(true);
    socket.emit("get_nearby_rooms", { userLat: coords.lat, userLng: coords.lng });
  }, [socket, coords]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setScanning(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoError(null);
      },
      (err) => {
        setGeoError(err.message);
        setScanning(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    scanRooms();
    const interval = setInterval(scanRooms, 5000);
    return () => clearInterval(interval);
  }, [coords, scanRooms]);

  useEffect(() => {
    const handleFeed = (data: Room[]) => {
      setRooms(data);
      setScanning(false);
    };
    socket.on("radar_feed", handleFeed);
    return () => { socket.off("radar_feed", handleFeed); };
  }, [socket, setRooms]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <RadarBackground />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-border bg-background/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-ghost-green animate-blink-green" />
          <h1 className="text-sm font-mono text-ghost-green tracking-widest uppercase">
            Ghost Radar
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded border border-ghost-green/20 bg-ghost-green/5">
            <User className="w-3 h-3 text-ghost-green/60" />
            <span className="text-[10px] font-mono text-ghost-green truncate max-w-[80px]">
              {store.userAlias || "UNIDENTIFIED"}
            </span>
          </div>

          <button
            onClick={onCreateRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ghost-green/30 text-ghost-green text-xs font-mono hover:bg-ghost-green/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Signal</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6">
        {geoError && (
          <div className="flex items-center gap-2 p-3 rounded-md border border-destructive/30 bg-destructive/5 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs font-mono text-destructive">{geoError}</p>
          </div>
        )}

        {scanning && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-ghost-green animate-blink-green" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-ghost-green/30 animate-radar-pulse"
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              ))}
            </div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              Scanning...
            </p>
          </div>
        )}

        {rooms.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase px-1">
              {rooms.length} Signal{rooms.length > 1 ? "s" : ""} active
            </p>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />
            ))}
          </div>
        )}
      </main>

      <footer className="relative z-10 px-4 py-3 border-t border-border bg-background/10">
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center tracking-wider italic">
          NODE: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "LOCATING..."}
        </p>
      </footer>
    </div>
  );
}