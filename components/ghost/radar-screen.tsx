"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Radio, Plus, AlertTriangle, User, MapPin } from "lucide-react";
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

const SCAN_RANGES = [500, 1000, 2000, 3000];

export function RadarScreen({ socket, rooms, setRooms, onJoinRoom, onCreateRoom }: RadarScreenProps) {
  const store = useGhostStore();
  const [scanning, setScanning] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scanRange, setScanRange] = useState<number>(500);


  const scanRooms = useCallback(() => {
    if (!coords) return;
    setScanning(true);
    socket.emit("get_nearby_rooms", { 
      userLat: coords.lat, 
      userLng: coords.lng,
      scanRange: scanRange 
    });
  }, [socket, coords, scanRange]);

  //  Single Socket Listener (No duplicates)
  useEffect(() => {
    const handleFeed = (data: Room[]) => {
    

      setRooms(data);
      setScanning(false);
    };

    socket.on("radar_feed", handleFeed);
    return () => {
      socket.off("radar_feed", handleFeed);
    };
  }, [socket, setRooms]);

 
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

  //  Auto-Refresh Interval
  useEffect(() => {
    if (!coords) return;
    
    scanRooms(); // Immediate scan when coords or range changes

    const interval = setInterval(scanRooms, 8000); // 8 sec interval for efficiency
    return () => clearInterval(interval);
  }, [coords, scanRange, scanRooms]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D0D0D]">
      <RadarBackground />

      <header className="relative z-10 flex flex-col border-b border-border bg-background/20 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-ghost-green animate-blink-green" />
            <h1 className="text-sm font-mono text-ghost-green tracking-widest uppercase">Ghost Radar</h1>
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
              <span className="hidden sm:inline">New Room</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-3 gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <MapPin className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase">Range:</span>
          </div>
          <div className="flex gap-1.5">
            {SCAN_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setScanRange(r)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${
                  scanRange === r 
                    ? "bg-ghost-green/20 border-ghost-green text-ghost-green" 
                    : "border-border text-muted-foreground"
                }`}
              >
                {r >= 1000 ? `${r/1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6 overflow-y-auto">
        {geoError && (
          <div className="flex items-center gap-2 p-3 rounded-md border border-destructive/30 bg-destructive/5 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-xs font-mono text-destructive">{geoError}</p>
          </div>
        )}

        {scanning && rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-8 h-8 border-2 border-ghost-green/20 border-t-ghost-green rounded-full animate-spin" />
             <p className="text-[10px] font-mono text-muted-foreground animate-pulse uppercase">Scanning Perimeter...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.length > 0 ? (
              <>
                <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase px-1">
                  {rooms.length} Signal{rooms.length > 1 ? "s" : ""} detected
                </p>
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} onJoin={() => onJoinRoom(room.id)} />
                ))}
              </>
            ) : (
              <div className="text-center py-24">
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Zero Signals Found in {scanRange}m</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}