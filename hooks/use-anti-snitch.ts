"use client";

import { useEffect, useCallback } from "react";

export function useAntiSnitch(onDetected: () => void, enabled: boolean) {
  const handleDetection = useCallback(() => {
    if (enabled) onDetected();
  }, [enabled, onDetected]);

  useEffect(() => {
    if (!enabled) return;

    // Detect PrintScreen / screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) || // macOS
        (e.ctrlKey && e.shiftKey && e.key === "S") // Windows Snip
      ) {
        e.preventDefault();
        handleDetection();
      }
    };

    // Detect right-click (prevent context menu for screenshots)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled, handleDetection]);
}
