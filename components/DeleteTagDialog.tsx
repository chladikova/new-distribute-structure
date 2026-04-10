"use client";

interface DeleteTagDialogProps {
  open: boolean;
  tagNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteTagDialog({
  open,
  tagNames,
  onConfirm,
  onCancel,
}: DeleteTagDialogProps) {
  if (!open) return null;

  const quoted = tagNames.map((n) => `"${n}"`).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div
        className="flex flex-col bg-white relative"
        style={{ width: 500, borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e0e0e0" }}>
          <span className="text-[16px] font-semibold" style={{ color: "#212121" }}>
            Delete tag(s)?
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
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 1L21 20H1L11 1Z" fill="#FFC107" stroke="#F9A825" strokeWidth="0.5" />
                <text x="11" y="16" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#5D4037">!</text>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] leading-5 m-0" style={{ color: "#E53935" }}>
                Do you really want to delete tag {quoted}?
              </p>
              <p className="text-[13px] leading-5 m-0" style={{ color: "#3a3a39" }}>
                Some of the selected tag(s) are assigned to some items, there could be some which
                you are not seeing. If you delete them, they will also be removed from those items.
              </p>
              <p className="text-[13px] leading-5 m-0" style={{ color: "#E53935" }}>
                Proceed with deletion?
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #e0e0e0" }}>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 h-9 px-5 rounded-sm text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#00897B", color: "white", border: "none" }}
            onClick={onConfirm}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3H11L10.2 13H3.8L3 3Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M1.5 3H12.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 1.5H9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            DELETE
          </button>
          <button
            type="button"
            className="flex items-center justify-center h-9 px-5 rounded-sm text-[13px] font-semibold cursor-pointer hover:opacity-70 transition-opacity"
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
