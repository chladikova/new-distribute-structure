"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="flex flex-col gap-6 w-[400px]"
        style={{
          backgroundColor: "white",
          borderRadius: 4,
          padding: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex flex-col gap-2">
          <h2
            className="text-[16px] font-semibold leading-6 m-0"
            style={{ color: "#212121" }}
          >
            {title}
          </h2>
          <p
            className="text-[14px] font-normal leading-5 m-0"
            style={{ color: "#40484b" }}
          >
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[13px] font-semibold px-4 py-2 cursor-pointer outline-none transition-colors duration-150 hover:bg-black/5"
            style={{
              color: "#40484b",
              border: "1px solid #d4d4d4",
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-[13px] font-semibold px-4 py-2 cursor-pointer outline-none transition-colors duration-150 hover:opacity-90"
            style={{
              color: "white",
              backgroundColor: "#e34243",
              border: "1px solid #e34243",
              borderRadius: 2,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
