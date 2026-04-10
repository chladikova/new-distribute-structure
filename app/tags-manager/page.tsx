"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SnackbarComponent from "@/components/Snackbar";
import EditTagDialog from "@/components/EditTagDialog";
import DeleteTagDialog from "@/components/DeleteTagDialog";
import { initialTags } from "@/lib/tags";
import type { Tag } from "@/lib/tags";

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center pl-3 py-2 shrink-0 cursor-pointer"
      style={{ width: 32 }}
      onClick={onChange}
    >
      <div className="flex items-center rounded" style={{ width: 20, height: 20 }}>
        <div
          className="rounded-sm transition-colors duration-100"
          style={{
            width: 16,
            height: 16,
            margin: 2,
            backgroundColor: checked || indeterminate ? "#2975d6" : "transparent",
            border: checked || indeterminate ? "1px solid #2975d6" : "1px solid #212121",
            position: "relative",
          }}
        >
          {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ position: "absolute", top: 2, left: 1 }}>
              <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {indeterminate && !checked && (
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" style={{ position: "absolute", top: 6, left: 2 }}>
              <rect width="10" height="2" rx="1" fill="white" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TagsManagerPage() {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [editTagId, setEditTagId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const handleCloseSnackbar = useCallback(() => setSnackbar({ open: false, message: "" }), []);

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase())),
    [tags, search],
  );

  const allSelected = filteredTags.length > 0 && filteredTags.every((t) => selectedIds.has(t.id));
  const someSelected = filteredTags.some((t) => selectedIds.has(t.id));

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const t of filteredTags) next.delete(t.id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const t of filteredTags) next.add(t.id);
        return next;
      });
    }
  }

  function openCreateDialog() {
    setEditMode("create");
    setEditTagId(null);
    setEditDialogOpen(true);
  }

  function openEditDialog() {
    if (selectedIds.size !== 1) return;
    const tagId = [...selectedIds][0];
    setEditMode("edit");
    setEditTagId(tagId);
    setEditDialogOpen(true);
  }

  function handleSaveTag(name: string, color: string) {
    if (editMode === "create") {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name,
        color,
        usageCount: 0,
        updated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " +
          new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      };
      setTags((prev) => [...prev, newTag]);
      setSnackbar({ open: true, message: `Tag "${name}" created successfully` });
    } else if (editTagId) {
      setTags((prev) =>
        prev.map((t) =>
          t.id === editTagId
            ? { ...t, name, color, updated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) }
            : t,
        ),
      );
      setSnackbar({ open: true, message: `Tag "${name}" updated successfully` });
    }
    setEditDialogOpen(false);
  }

  function handleDeleteConfirm() {
    const names = tags.filter((t) => selectedIds.has(t.id)).map((t) => t.name);
    setTags((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
    setSnackbar({ open: true, message: `${names.length} tag${names.length !== 1 ? "s" : ""} deleted` });
  }

  const editTag = editTagId ? tags.find((t) => t.id === editTagId) : null;

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 flex-col min-h-0 min-w-0" style={{ backgroundColor: "white" }}>
          {/* Title bar */}
          <div className="flex flex-col items-start justify-center pb-3" style={{ borderBottom: "1px solid #e9e9e9" }}>
            <div className="flex w-full items-center pr-6">
              <div className="flex flex-1 flex-col items-start min-w-0">
                <div className="flex flex-col items-start justify-end px-[26px]" style={{ height: 53 }}>
                  <span className="text-[22px] font-normal leading-8 truncate" style={{ color: "#212121" }}>
                    Tags
                  </span>
                </div>
                <div className="flex flex-col items-start justify-end px-[26px]">
                  <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#212121" }}>
                    You can have 50 tags at one time.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col min-h-0 overflow-auto" style={{ backgroundColor: "#f5f5f5" }}>
            <div className="flex flex-col px-[26px] pt-[26px] pb-[26px] flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                {/* Toolbar */}
                <div
                  className="flex items-center justify-between w-full"
                  style={{ backgroundColor: "#f5f5f5", border: "1px solid #cfcfcf" }}
                >
                  <div className="flex items-center self-stretch">
                    <div
                      className="flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={openCreateDialog}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2V14M2 8H14" stroke="#098294" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#098294" }}>
                        Create New
                      </span>
                    </div>
                    {selectedIds.size === 1 && (
                      <div
                        className="flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={openEditDialog}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="#40484b" strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#40484b" }}>Edit</span>
                      </div>
                    )}
                    {selectedIds.size > 0 && (
                      <div
                        className="flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4H12L11.2 14H4.8L4 4Z" stroke="#40484b" strokeWidth="1.2" strokeLinejoin="round" />
                          <path d="M2.5 4H13.5" stroke="#40484b" strokeWidth="1.2" strokeLinecap="round" />
                          <path d="M6 2.5H10" stroke="#40484b" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#40484b" }}>Delete</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pr-4">
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-[7px]">
                        <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#adadad" }}>
                          {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedIds(new Set())}
                          className="outline-none cursor-pointer hover:opacity-70"
                          style={{ background: "none", border: "none", padding: 0 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="#adadad" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div
                      className="flex items-center gap-2 pl-2 pr-2"
                      style={{ height: 32, border: "1px solid #d4d4d4", borderRadius: 2, backgroundColor: "white" }}
                    >
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="text-[13px] font-normal outline-none"
                        style={{ width: 120, border: "none", color: "#212121" }}
                      />
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="#9e9e9e" strokeWidth="1.5" />
                        <path d="M11 11L14 14" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ border: "1px solid #cfcfcf", borderTop: "none", backgroundColor: "white" }}>
                  <div className="flex flex-col" style={{ minWidth: 800 }}>
                    {/* Header */}
                    <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
                      <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
                      {[
                        { label: "Name", width: 240 },
                        { label: "Preview", width: 200 },
                        { label: "Usage Count", width: 120 },
                        { label: "Updated", flex: true },
                      ].map((col) => (
                        <div
                          key={col.label}
                          className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`}
                          style={col.flex ? undefined : { width: col.width }}
                        >
                          <div className="flex items-center w-full pl-3">
                            <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
                              <span className="text-[13px] font-normal leading-5 truncate block" style={{ color: "#adadad" }}>
                                {col.label}
                              </span>
                            </div>
                          </div>
                          <div className="w-full" style={{ height: 1, backgroundColor: "rgba(33,33,33,0.08)" }} />
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col">
                      {filteredTags.map((tag) => {
                        const selected = selectedIds.has(tag.id);
                        const hovered = hoveredId === tag.id;
                        let bg = "white";
                        if (selected) bg = "#eeeeee";
                        else if (hovered) bg = "#f8f8f8";

                        return (
                          <div
                            key={tag.id}
                            className="flex items-center w-full transition-colors duration-100"
                            style={{ backgroundColor: bg, borderBottom: "1px solid #dedede" }}
                            onMouseEnter={() => setHoveredId(tag.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <Checkbox checked={selected} onChange={() => toggleRow(tag.id)} />
                            <div className="flex items-center shrink-0 px-3 py-2" style={{ width: 240 }}>
                              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                                {tag.name}
                              </span>
                            </div>
                            <div className="flex items-center shrink-0 pl-6 pr-3 py-2" style={{ width: 200 }}>
                              <span
                                className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap overflow-hidden text-ellipsis"
                                style={{ backgroundColor: tag.color, color: "white", border: `1px solid ${tag.color}`, fontFamily: "'Open Sans', sans-serif", maxWidth: 170 }}
                              >
                                {tag.name}
                              </span>
                            </div>
                            <div className="flex items-center shrink-0 px-3 py-2" style={{ width: 120 }}>
                              <span className="text-[14px] font-normal leading-5" style={{ color: "#3a3a39" }}>
                                {tag.usageCount}
                              </span>
                            </div>
                            <div className="flex flex-1 items-center min-w-0 px-3 py-2">
                              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                                {tag.updated}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredTags.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                          <span className="text-[14px]" style={{ color: "#9e9e9e" }}>No tags found.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <EditTagDialog
        open={editDialogOpen}
        mode={editMode}
        initialName={editMode === "edit" && editTag ? editTag.name : ""}
        initialColor={editMode === "edit" && editTag ? editTag.color : "#2E95BE"}
        onSave={handleSaveTag}
        onCancel={() => setEditDialogOpen(false)}
      />

      <DeleteTagDialog
        open={deleteDialogOpen}
        tagNames={tags.filter((t) => selectedIds.has(t.id)).map((t) => t.name)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}
