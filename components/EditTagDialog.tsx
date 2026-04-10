"use client";

import { useState, useEffect } from "react";
import { COLOR_PALETTE } from "@/lib/tags";
import FlagTag from "@/components/FlagTag";

interface EditTagDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}

export default function EditTagDialog({
  open,
  mode,
  initialName = "",
  initialColor = "#2E95BE",
  onSave,
  onCancel,
}: EditTagDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [hexInput, setHexInput] = useState(initialColor.replace("#", ""));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recentColors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColor);
      setHexInput(initialColor.replace("#", ""));
      setPickerOpen(false);
    }
  }, [open, initialName, initialColor]);

  if (!open) return null;

  function handleHexChange(val: string) {
    const cleaned = val.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexInput(cleaned);
    if (cleaned.length === 6) {
      setColor(`#${cleaned}`);
    }
  }

  function handleSwatchClick(c: string) {
    setColor(c);
    setHexInput(c.replace("#", ""));
    setPickerOpen(false);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave(name.trim(), color);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div
        className="flex flex-col bg-white relative"
        style={{ width: 460, borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e0e0e0" }}>
          <span className="text-[16px] font-semibold" style={{ color: "#212121" }}>
            {mode === "create" ? "Create New Tag" : "Edit Tag"}
          </span>
          <button
            type="button"
            className="cursor-pointer hover:opacity-60"
            style={{ background: "none", border: "none", padding: 4 }}
            onClick={onCancel}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Tag Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-normal" style={{ color: "#3a3a39" }}>
              <span style={{ color: "#E53935" }}>*</span>Tag Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              className="text-[13px] font-normal outline-none"
              style={{
                height: 36,
                border: "1px solid #d4d4d4",
                borderRadius: 2,
                padding: "0 12px",
                color: "#212121",
              }}
              placeholder="Tag name"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-normal" style={{ color: "#3a3a39" }}>
              <span style={{ color: "#E53935" }}>*</span>Color:
            </label>
            <div className="flex items-center gap-2">
              <div
                className="shrink-0 cursor-pointer rounded-sm"
                style={{ width: 28, height: 28, backgroundColor: color, border: "1px solid #d4d4d4" }}
                onClick={() => setPickerOpen(!pickerOpen)}
              />
              <div className="flex items-center" style={{ border: "1px solid #d4d4d4", borderRadius: 2, height: 36 }}>
                <span className="text-[13px] pl-2" style={{ color: "#9e9e9e" }}>#</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="text-[13px] font-normal outline-none"
                  style={{ width: 80, height: 34, padding: "0 8px", color: "#212121", border: "none" }}
                  maxLength={6}
                />
              </div>
            </div>

            {/* Tag Preview */}
            {name.trim() && (
              <div className="flex items-center pt-1 pl-2">
                <FlagTag
                  label={name.trim()}
                  bgColor={color}
                  textColor="white"
                  borderColor={color}
                />
              </div>
            )}

            {/* Color Picker Dropdown */}
            {pickerOpen && (
              <div
                className="flex flex-col gap-2 p-3 mt-1"
                style={{ border: "1px solid #d4d4d4", borderRadius: 4, backgroundColor: "white" }}
              >
                <div className="flex flex-wrap gap-1">
                  {COLOR_PALETTE.map((c) => (
                    <div
                      key={c}
                      className="cursor-pointer rounded-sm hover:scale-110 transition-transform"
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: c,
                        border: c === color ? "2px solid #212121" : "1px solid #e0e0e0",
                      }}
                      onClick={() => handleSwatchClick(c)}
                    />
                  ))}
                </div>
                {recentColors.length > 0 && (
                  <>
                    <span className="text-[11px]" style={{ color: "#9e9e9e" }}>Recently Selected</span>
                    <div className="flex gap-1">
                      {recentColors.map((c) => (
                        <div
                          key={c}
                          className="cursor-pointer rounded-sm"
                          style={{ width: 22, height: 22, backgroundColor: c, border: "1px solid #e0e0e0" }}
                          onClick={() => handleSwatchClick(c)}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    className="text-[12px] font-semibold cursor-pointer hover:opacity-70"
                    style={{ background: "none", border: "none", color: "#616161", padding: "2px 4px" }}
                    onClick={() => setPickerOpen(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #e0e0e0" }}>
          <button
            type="button"
            className="flex items-center justify-center h-9 px-6 rounded-sm text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#2E95BE", color: "white", border: "none" }}
            onClick={handleSave}
          >
            {mode === "create" ? "CREATE" : "SAVE"}
          </button>
          <button
            type="button"
            className="flex items-center justify-center h-9 px-6 rounded-sm text-[13px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            style={{ backgroundColor: "#e0e0e0", color: "#424242", border: "none" }}
            onClick={onCancel}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
