"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, Shield, UserX, Bomb, Check } from "lucide-react";
import type { JoinRequest, RoomUser } from "@/lib/types";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  joinRequests: JoinRequest[];
  roomUsers: RoomUser[];
  onApprove: (socketId: string) => void;
  onReject: (socketId: string) => void;
  onExile: (socketId: string) => void;
  onNuke: () => void;
}

export function AdminSidebar({
  open,
  onClose,
  joinRequests,
  roomUsers,
  onApprove,
  onReject,
  onExile,
  onNuke,
}: AdminSidebarProps) {
  const [nukeHolding, setNukeHolding] = useState(false);
  const [nukeProgress, setNukeProgress] = useState(0);
  const nukeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nukeStart = useRef<number>(0);

  const startNuke = useCallback(() => {
    setNukeHolding(true);
    nukeStart.current = Date.now();
    nukeTimer.current = setInterval(() => {
      const elapsed = Date.now() - nukeStart.current;
      const progress = Math.min(elapsed / 1500, 1);
      setNukeProgress(progress);
      if (progress >= 1) {
        if (nukeTimer.current) clearInterval(nukeTimer.current);
        onNuke();
        setNukeHolding(false);
        setNukeProgress(0);
      }
    }, 50);
  }, [onNuke]);

  const cancelNuke = useCallback(() => {
    if (nukeTimer.current) clearInterval(nukeTimer.current);
    setNukeHolding(false);
    setNukeProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (nukeTimer.current) clearInterval(nukeTimer.current);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-ghost-deep/60 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-ghost-surface border-l border-border z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Admin controls"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-ghost-green" />
            <span className="text-xs font-mono text-ghost-green tracking-wider uppercase">
              Control Room
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-ghost-grey rounded transition-colors" aria-label="Close sidebar">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Join Requests */}
        {joinRequests.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-2">
              Pending Requests ({joinRequests.length})
            </p>
            <div className="flex flex-col gap-2">
              {joinRequests.map((req) => (
                <div
                  key={req.socketId}
                  className="flex items-center justify-between p-2 rounded border border-ghost-green/20 bg-ghost-green/5 animate-float-up"
                >
                  <span className="text-xs font-mono text-foreground">{req.alias}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onApprove(req.socketId)}
                      className="p-1 rounded bg-ghost-green/20 hover:bg-ghost-green/30 transition-colors"
                      aria-label={`Accept ${req.alias}`}
                    >
                      <Check className="w-3 h-3 text-ghost-green" />
                    </button>
                    <button
                      onClick={() => onReject(req.socketId)}
                      className="p-1 rounded bg-destructive/20 hover:bg-destructive/30 transition-colors"
                      aria-label={`Reject ${req.alias}`}
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Slots */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mb-2">
            Shadows Online ({roomUsers.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {roomUsers.map((user) => (
              <div
                key={user.socketId}
                className="flex items-center justify-between p-2 rounded border border-border group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-ghost-grey flex items-center justify-center">
                    <span className="text-[8px] font-mono text-muted-foreground">
                      {user.alias.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-foreground">{user.alias}</span>
                    <span className="text-[8px] font-mono text-muted-foreground/50">
                      {new Date(user.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onExile(user.socketId)}
                  className="p-1 rounded-full border border-destructive/30 text-destructive opacity-0 group-hover:opacity-100 hover:animate-vibrate transition-opacity"
                  aria-label={`Exile ${user.alias}`}
                >
                  <UserX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nuke Button */}
        <div className="px-4 py-4 border-t border-border">
          <button
            onMouseDown={startNuke}
            onMouseUp={cancelNuke}
            onMouseLeave={cancelNuke}
            onTouchStart={startNuke}
            onTouchEnd={cancelNuke}
            className="relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-destructive/40 text-destructive font-mono text-xs overflow-hidden transition-colors hover:border-destructive"
            aria-label="Hold 1.5 seconds to nuke room"
          >
            <div
              className="absolute inset-0 bg-destructive/20 transition-all"
              style={{ width: `${nukeProgress * 100}%` }}
            />
            <Bomb className={`w-3.5 h-3.5 relative z-10 ${nukeHolding ? "animate-vibrate" : ""}`} />
            <span className="relative z-10">
              {nukeHolding ? "HOLD..." : "GLOBAL NUKE"}
            </span>
          </button>
          <p className="text-[8px] font-mono text-muted-foreground/40 text-center mt-1">
            Long press 1.5s to destroy room
          </p>
        </div>
      </aside>
    </>
  );
}
