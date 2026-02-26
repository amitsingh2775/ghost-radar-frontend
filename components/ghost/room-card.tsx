"use client";

import { Wifi, Flame } from "lucide-react";
import type { Room } from "@/lib/types";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

function getSignalStrength(dist: number): number {
  if (dist <= 100) return 5;
  if (dist <= 200) return 4;
  if (dist <= 300) return 3;
  if (dist <= 400) return 2;
  return 1;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const signal = getSignalStrength(room.dist);
  const heatLevel = Number(room.heat) || 0;

  return (
    <button
      onClick={() => onJoin(room.id)}
      className="glass w-full p-4 rounded-lg text-left transition-all hover:border-ghost-green/50 animate-float-up group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm text-foreground truncate">{room.name}</h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {Math.round(room.dist)}m away
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Heat indicator */}
          <div className="flex items-center gap-1">
            <Flame
              className={`w-3.5 h-3.5 ${heatLevel > 5 ? "text-ghost-gold" : "text-muted-foreground"}`}
            />
            <span className={`text-xs font-mono ${heatLevel > 5 ? "text-ghost-gold" : "text-muted-foreground"}`}>
              {heatLevel}
            </span>
          </div>

          {/* Signal strength bars */}
          <div className="flex items-end gap-px">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-sm transition-colors ${
                  bar <= signal ? "bg-ghost-green" : "bg-ghost-grey"
                }`}
                style={{ height: `${bar * 3 + 4}px` }}
              />
            ))}
          </div>

          <Wifi className="w-3.5 h-3.5 text-ghost-green opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Signal strength bar */}
      <div className="mt-3 h-0.5 rounded-full bg-ghost-grey overflow-hidden">
        <div
          className="h-full bg-ghost-green transition-all rounded-full"
          style={{ width: `${signal * 20}%` }}
        />
      </div>
    </button>
  );
}
