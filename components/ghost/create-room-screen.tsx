"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Radio, Loader2, Clock, Edit3 } from "lucide-react";
import type { Socket } from "socket.io-client";

interface CreateRoomScreenProps {
  socket: Socket;
  onBack: () => void;
  onCreated: (roomId: string, roomName: string, expiresAt: number) => void;
  userAlias: string | null; // 🔥 Added to sync admin identity
}

const PRESETS = [15, 30, 60];

export function CreateRoomScreen({ socket, onBack, onCreated, userAlias }: CreateRoomScreenProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [isCustom, setIsCustom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || creating) return;
    
    if (duration < 1 || duration > 1440) {
      setError("Duration must be between 1 and 1440 minutes.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 5000 
        });
      });

      const res = await fetch("http://localhost:5000/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSocketId: socket.id,
          name: name.trim(),
          time: Number(duration),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      });

      if (!res.ok) {
        setError("Failed to create signal. Try again.");
        setCreating(false);
        return;
      }

      const data = await res.json();
      
      if (data.roomId) {
        // 🔥 FIX: Send as an OBJECT to match backend expectation and prevent null Redis args
        socket.emit("admin_join_room", { 
          roomId: data.roomId, 
          userAlias: userAlias 
        });
        
        onCreated(data.roomId, name.trim(), data.expiresAt);
      } else {
        setError("No room ID returned.");
        setCreating(false);
      }
    } catch (err) {
      setError("Connection failed. Check your network.");
      setCreating(false);
    }
  }, [name, creating, socket, onCreated, duration, userAlias]);

  return (
    <div className="relative min-h-screen flex flex-col grid-bg">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border bg-ghost-surface/50 backdrop-blur-md">
        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-ghost-surface transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h1 className="text-sm font-mono text-ghost-green tracking-widest uppercase">New Signal</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="relative">
          <Radio className="w-8 h-8 text-ghost-green" />
          {[0, 1].map((i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-ghost-green/20 animate-radar-pulse" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>

        <div className="w-full max-w-xs flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Signal Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter codename..." className="w-full px-3 py-2.5 rounded-md bg-ghost-surface border border-border text-foreground font-mono text-sm focus:border-ghost-green/50 outline-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5"><Clock className="w-3 h-3" /> Expiry (Minutes)</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((opt) => (
                <button key={opt} onClick={() => { setDuration(opt); setIsCustom(false); }} className={`py-1.5 rounded border font-mono text-[10px] ${!isCustom && duration === opt ? "bg-ghost-green/10 border-ghost-green text-ghost-green" : "bg-ghost-surface border-border text-muted-foreground"}`}>{opt}m</button>
              ))}
              <button onClick={() => setIsCustom(true)} className={`py-1.5 rounded border font-mono text-[10px] flex items-center justify-center gap-1 ${isCustom ? "bg-ghost-green/10 border-ghost-green text-ghost-green" : "bg-ghost-surface border-border text-muted-foreground"}`}><Edit3 className="w-3 h-3" /> Custom</button>
            </div>
            {isCustom && <input type="number" min="1" max="1440" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} className="mt-2 w-full px-3 py-2 rounded-md bg-ghost-surface border border-ghost-green/30 text-ghost-green font-mono text-xs outline-none" />}
          </div>

          {error && <p className="text-[10px] font-mono text-destructive tracking-wider animate-pulse text-center">{error}</p>}

          <button onClick={handleCreate} disabled={!name.trim() || creating || duration <= 0} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-ghost-green text-primary-foreground font-mono text-sm hover:bg-ghost-green/90 disabled:opacity-30 transition-all">
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Broadcasting...</span></> : <span>Broadcast Signal</span>}
          </button>
        </div>
      </main>
    </div>
  );
}