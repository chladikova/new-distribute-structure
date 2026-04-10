"use client";

import { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Snackbar({
  message,
  open,
  onClose,
  duration = 4000,
}: SnackbarProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setFading(false);
      const fadeTimer = setTimeout(() => setFading(true), duration - 400);
      const closeTimer = setTimeout(() => {
        setVisible(false);
        setFading(false);
        onClose();
      }, duration);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setVisible(false);
      setFading(false);
    }
  }, [open, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 transition-opacity duration-400"
      style={{
        backgroundColor: "white",
        borderRadius: 6,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        opacity: fading ? 0 : 1,
        minWidth: 260,
        maxWidth: 380,
      }}
    >
      <div className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#4CAF50" />
          <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="flex-1 text-[13px] font-normal leading-5" style={{ color: "#3a3a39" }}>
        {message}
      </span>
      <button
        type="button"
        className="shrink-0 flex items-center justify-center cursor-pointer hover:opacity-60 transition-opacity"
        style={{ width: 20, height: 20, background: "none", border: "none", padding: 0 }}
        onClick={() => {
          setVisible(false);
          setFading(false);
          onClose();
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
