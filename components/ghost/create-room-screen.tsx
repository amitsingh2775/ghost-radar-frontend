"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { ArrowLeft, Radio, Loader2, Clock, Edit3, MapPin } from "lucide-react";
import type { Socket } from "socket.io-client";

interface CreateRoomScreenProps {
  socket: Socket;
  onBack: () => void;
  onCreated: (roomId: string, roomName: string, expiresAt: number) => void;
  userAlias: string | null;
}

const PRESETS = [15, 30, 60];
const RANGE_PRESETS = [500, 1000, 2000, 3000];

export function CreateRoomScreen({ socket, onBack, onCreated, userAlias }: CreateRoomScreenProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [range, setRange] = useState<number>(500);
  const [isCustom, setIsCustom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || creating) return;
    
    setCreating(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 10000 
        });
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/create`, {
        adminSocketId: socket.id,
        name: name.trim(),
        time: Number(duration),
        range: Number(range), 
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const data = response.data;
      
      if (data.roomId) {
        socket.emit("admin_join_room", { 
          roomId: data.roomId, 
          userAlias: userAlias 
        });
        onCreated(data.roomId, name.trim(), data.expiresAt);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to broadcast. Check GPS/Network.";
      setError(msg);
      setCreating(false);
    }
  }, [name, creating, socket, onCreated, duration, range, userAlias]);

  return (
    <div className="relative min-h-screen flex flex-col grid-bg bg-[#0D0D0D]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border bg-ghost-surface/50 backdrop-blur-md">
        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-ghost-surface transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <h1 className="text-sm font-mono text-ghost-green tracking-widest uppercase">New Room</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8 py-10 overflow-y-auto">
        <div className="relative">
          <Radio className="w-8 h-8 text-ghost-green" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-ghost-green/20 animate-radar-pulse" />
        </div>

        <div className="w-full max-w-xs flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider text-left">Room Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter room name..." className="w-full px-3 py-2.5 rounded-md bg-ghost-surface border border-border text-foreground font-mono text-sm focus:border-ghost-green/50 outline-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex justify-between items-center">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Visibility Range</span>
              <span className="text-ghost-green">{range >= 1000 ? `${range/1000}km` : `${range}m`}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RANGE_PRESETS.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`py-1.5 rounded border font-mono text-[9px] transition-all ${range === r ? "bg-ghost-green/10 border-ghost-green text-ghost-green" : "bg-ghost-surface border-border text-muted-foreground hover:border-ghost-green/30"}`}>
                  {r >= 1000 ? `${r/1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3 h-3" /> Auto-Destruct</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((opt) => (
                <button key={opt} onClick={() => { setDuration(opt); setIsCustom(false); }} className={`py-1.5 rounded border font-mono text-[9px] ${!isCustom && duration === opt ? "bg-ghost-green/10 border-ghost-green text-ghost-green" : "bg-ghost-surface border-border text-muted-foreground"}`}>{opt}m</button>
              ))}
              <button onClick={() => setIsCustom(true)} className={`py-1.5 rounded border font-mono text-[9px] flex items-center justify-center gap-1 ${isCustom ? "bg-ghost-green/10 border-ghost-green text-ghost-green" : "bg-ghost-surface border-border text-muted-foreground"}`}><Edit3 className="w-3 h-3" /> Custom</button>
            </div>
            {isCustom && <input type="number" min="1" max="1440" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} className="mt-2 w-full px-3 py-2 rounded-md bg-ghost-surface border border-ghost-green/30 text-ghost-green font-mono text-xs outline-none" />}
          </div>

          {error && <p className="text-[10px] font-mono text-destructive text-center">{error}</p>}

          <button onClick={handleCreate} disabled={!name.trim() || creating} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-ghost-green text-primary-foreground font-mono text-sm font-bold hover:bg-ghost-green/90 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            {creating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Room...</span></> : <span>Create Room</span>}
          </button>
        </div>
      </main>
    </div>
  );
}