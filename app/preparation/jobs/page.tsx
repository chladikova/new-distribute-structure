"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DetailSidebar from "@/components/DetailSidebar";
import SnackbarComponent from "@/components/Snackbar";
import type { Remark } from "@/components/DetailSidebar";
import { initialTags, COLOR_PALETTE } from "@/lib/tags";
import type { Tag } from "@/lib/tags";

/* ─── Types ─── */

type ChannelIcon = "variable" | "archive" | "at" | "desktop";

type ProcessingStatus = "New draft" | "Waiting for Approval" | "Scheduling" | "Submitted" | "Rejected";

interface JobRowData {
  id: string;
  jobId: string;
  tags: Tag[];
  remarks: Remark[];
  channelIcon: ChannelIcon;
  communicationType: string;
  processingStatus: ProcessingStatus;
  team: string;
  owner: string;
  jobCreated: string;
}

const TAB_TO_STATUS: Record<string, ProcessingStatus> = {
  "Drafts": "New draft",
  "Waiting for Approval": "Waiting for Approval",
  "Scheduling": "Scheduling",
  "Submitted": "Submitted",
  "Rejected": "Rejected",
};

/* ─── Mock data ─── */

const NEEDS_ATTENTION_TAG: Tag = { id: "needs-attention", name: "Needs Attention", color: "#df4397", usageCount: 0, updated: "" };
const t = initialTags;

const initialRows: JobRowData[] = [
  // --- New draft (Drafts tab) ---
  { id: "job-1", jobId: "567890123", tags: [NEEDS_ATTENTION_TAG], remarks: [
    { id: "r1-1", author: "Author name", authorType: "user", date: "Jan 6, 2026 3:12 PM", message: "Rq 04920955\nCSE for this customer is 013 not on the invoice, make rq\nconcerns order 2102742726" },
    { id: "r1-2", author: "System", authorType: "system", date: "Jan 6, 2026 2:58 PM", message: "The service code (null) must be entered for the debtor specified in the payment request.", isError: true },
  ], channelIcon: "variable", communicationType: "Invoice", processingStatus: "New draft", team: "Everyone |default|", owner: "Me", jobCreated: "Jan 6, 2026 5:00 PM" },
  { id: "job-2", jobId: "567890124", tags: [t[1]], remarks: [
    { id: "r2-1", author: "Author name", authorType: "user", date: "Jan 5, 2026 11:30 AM", message: "Dept 25 - Leader Catherine - Customer DEPARTEMENT DU DOUBS\nConcerns order 2102742391" },
  ], channelIcon: "archive", communicationType: "Letter", processingStatus: "New draft", team: "Marketing", owner: "John D.", jobCreated: "Jan 5, 2026 11:30 AM" },
  { id: "job-3", jobId: "567890125", tags: [], remarks: [
    { id: "r3-1", author: "Author name", authorType: "user", date: "Jan 4, 2026 9:15 AM", message: "Campaign draft created, pending content review." },
  ], channelIcon: "desktop", communicationType: "Email", processingStatus: "New draft", team: "Marketing", owner: "Me", jobCreated: "Jan 4, 2026 9:15 AM" },

  // --- Waiting for Approval ---
  { id: "job-4", jobId: "567890126", tags: [], remarks: [
    { id: "r4-1", author: "Author name", authorType: "user", date: "Jan 3, 2026 2:00 PM", message: "This invoice is a duplicate, already paid on 08/07/24." },
  ], channelIcon: "at", communicationType: "Email", processingStatus: "Waiting for Approval", team: "Everyone |default|", owner: "Sarah M.", jobCreated: "Jan 3, 2026 2:00 PM" },
  { id: "job-5", jobId: "567890127", tags: [t[0], t[2]], remarks: [
    { id: "r5-1", author: "Author name", authorType: "user", date: "Jan 2, 2026 4:45 PM", message: "Awaiting approval from supervisor." },
  ], channelIcon: "desktop", communicationType: "Invoice", processingStatus: "Waiting for Approval", team: "Everyone |default|", owner: "Me", jobCreated: "Jan 2, 2026 4:45 PM" },
  { id: "job-6", jobId: "567890128", tags: [NEEDS_ATTENTION_TAG], remarks: [
    { id: "r6-1", author: "Author name", authorType: "user", date: "Jan 1, 2026 10:00 AM", message: "Template updated, ready for review." },
    { id: "r6-2", author: "System", authorType: "system", date: "Jan 1, 2026 9:45 AM", message: "Approval workflow initiated.", isError: false },
  ], channelIcon: "variable", communicationType: "Letter", processingStatus: "Waiting for Approval", team: "Finance", owner: "John D.", jobCreated: "Jan 1, 2026 10:00 AM" },

  // --- Scheduling ---
  { id: "job-7", jobId: "567890129", tags: [], remarks: [
    { id: "r7-1", author: "Author name", authorType: "user", date: "Dec 31, 2025 3:30 PM", message: "Scheduling batch for overnight processing." },
  ], channelIcon: "archive", communicationType: "Letter", processingStatus: "Scheduling", team: "Operations", owner: "Sarah M.", jobCreated: "Dec 31, 2025 3:30 PM" },
  { id: "job-8", jobId: "567890130", tags: [t[4], t[7], t[9]], remarks: [
    { id: "r8-1", author: "Author name", authorType: "user", date: "Dec 30, 2025 1:15 PM", message: "Holiday batch - scheduled for Jan 2." },
  ], channelIcon: "at", communicationType: "Email", processingStatus: "Scheduling", team: "Marketing", owner: "Mike R.", jobCreated: "Dec 30, 2025 1:15 PM" },

  // --- Submitted ---
  { id: "job-9", jobId: "567890131", tags: [], remarks: [
    { id: "r9-1", author: "Author name", authorType: "user", date: "Dec 29, 2025 11:00 AM", message: "Processed and sent to production queue." },
  ], channelIcon: "desktop", communicationType: "Letter", processingStatus: "Submitted", team: "Operations", owner: "Sarah M.", jobCreated: "Dec 29, 2025 11:00 AM" },
  { id: "job-10", jobId: "567890132", tags: [t[3], t[5]], remarks: [
    { id: "r10-1", author: "Author name", authorType: "user", date: "Dec 28, 2025 9:45 AM", message: "Final review completed. Ready for submission." },
  ], channelIcon: "archive", communicationType: "Invoice", processingStatus: "Submitted", team: "Finance", owner: "John D.", jobCreated: "Dec 28, 2025 9:45 AM" },
  { id: "job-11", jobId: "567890133", tags: [t[8], t[1]], remarks: [
    { id: "r11-1", author: "Author name", authorType: "user", date: "Dec 27, 2025 2:30 PM", message: "Submitted to ChorusPro B2G portal." },
  ], channelIcon: "variable", communicationType: "Invoice", processingStatus: "Submitted", team: "Everyone |default|", owner: "Me", jobCreated: "Dec 27, 2025 2:30 PM" },

  // --- Rejected ---
  { id: "job-12", jobId: "567890134", tags: [NEEDS_ATTENTION_TAG, t[6], t[2]], remarks: [
    { id: "r12-1", author: "Author name", authorType: "user", date: "Dec 26, 2025 4:00 PM", message: "Invoice flagged for manual review due to missing reference." },
    { id: "r12-2", author: "System", authorType: "system", date: "Dec 26, 2025 3:50 PM", message: "The service code does not exist in the repository.", isError: true },
  ], channelIcon: "variable", communicationType: "Invoice", processingStatus: "Rejected", team: "Finance", owner: "Me", jobCreated: "Dec 26, 2025 4:00 PM" },
  { id: "job-13", jobId: "567890135", tags: [NEEDS_ATTENTION_TAG], remarks: [
    { id: "r13-1", author: "Author name", authorType: "user", date: "Dec 25, 2025 8:00 AM", message: "Recipient address validation failed for 3 entries." },
    { id: "r13-2", author: "System", authorType: "system", date: "Dec 25, 2025 7:55 AM", message: "Address validation error: postal code mismatch.", isError: true },
    { id: "r13-3", author: "Author name", authorType: "user", date: "Dec 25, 2025 7:50 AM", message: "Investigating address data source." },
  ], channelIcon: "at", communicationType: "Email", processingStatus: "Rejected", team: "Everyone |default|", owner: "Mike R.", jobCreated: "Dec 25, 2025 8:00 AM" },
  { id: "job-14", jobId: "567890136", tags: [NEEDS_ATTENTION_TAG, t[4]], remarks: Array.from({ length: 20 }, (_, i) => ({
    id: `r14-${i + 1}`,
    author: i % 3 === 0 ? "System" : "Author name",
    authorType: (i % 3 === 0 ? "system" : "user") as "system" | "user",
    date: "Dec 24, 2025 10:00 AM",
    message: i % 3 === 0 ? "Automated validation check failed." : `Comment #${i + 1}: Review note for batch processing job.`,
    isError: i % 3 === 0,
  })), channelIcon: "desktop", communicationType: "Invoice", processingStatus: "Rejected", team: "Finance", owner: "Me", jobCreated: "Dec 24, 2025 10:00 AM" },
];

/* ─── Shared small components ─── */

function ToolbarIcon({ src, inset }: { src: string; inset: string }) {
  return (
    <div className="relative shrink-0 size-5 overflow-hidden">
      <div className="absolute" style={{ inset }}>
        <img src={src} alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}

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

function NeedsAttentionTag() {
  return (
    <span
      className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap"
      style={{
        backgroundColor: "#df4397",
        color: "white",
        border: "1px solid #cc026f",
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      Needs Attention
    </span>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap"
      style={{
        backgroundColor: tag.color,
        color: "white",
        border: `1px solid ${tag.color}`,
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      {tag.name}
    </span>
  );
}

function TagsCell({ tags }: { tags: Tag[] }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (tags.length === 0) return <div className="self-stretch shrink-0" style={{ width: 180 }} />;

  const needsAttention = tags.find((t) => t.id === "needs-attention");
  const normalTags = tags.filter((t) => t.id !== "needs-attention");

  const visibleTags = normalTags.slice(0, 1);
  const hiddenTags = normalTags.slice(1);
  const hiddenCount = hiddenTags.length;

  function handleMouseEnter(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + 4 });
    setTooltipVisible(true);
  }

  return (
    <div
      className="flex items-center self-stretch shrink-0 overflow-hidden px-3 py-[6px]"
      style={{ width: 180, gap: 4 }}
    >
      {needsAttention && <NeedsAttentionTag />}
      {!needsAttention && visibleTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
      {hiddenCount > 0 && (
        <span
          className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap cursor-default"
          style={{
            backgroundColor: "#f0f0f0",
            color: "#3a3a39",
            border: "1px solid #d4d4d4",
            fontFamily: "'Open Sans', sans-serif",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          +{hiddenCount}
        </span>
      )}

      {tooltipVisible && hiddenTags.length > 0 && (
        <div
          className="fixed z-50 flex flex-wrap items-center p-2"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            backgroundColor: "#323232",
            borderRadius: 4,
            boxShadow: "0 2px 3px rgba(0,0,0,0.24), 0 1px 3px rgba(0,0,0,0.16)",
            gap: "6px",
            maxWidth: 300,
          }}
        >
          {hiddenTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap"
              style={{
                backgroundColor: tag.color,
                color: "white",
                border: `1px solid ${tag.color}`,
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RemarkCell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div className="flex items-start gap-1 px-3 py-2 cursor-pointer hover:opacity-70" onClick={onClick}>
      <div className="relative shrink-0 size-5 overflow-hidden">
        <img src="/icons/comment-icon.svg" alt="" className="absolute inset-0 size-full" style={{ opacity: 0.6 }} />
      </div>
      <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
        ({count})
      </span>
    </div>
  );
}

const channelIconMap: Record<ChannelIcon, string> = {
  variable: "/icons/variable.svg",
  archive: "/icons/archive.svg",
  at: "/icons/at.svg",
  desktop: "/icons/desktop.svg",
};

function ChannelCell({ icon }: { icon: ChannelIcon }) {
  return (
    <div className="flex items-start px-3 py-2">
      <div className="relative shrink-0 size-5 overflow-hidden">
        <img src={channelIconMap[icon]} alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}

/* ─── New Job Dropdown ─── */

const newJobMenuItems = [
  { label: "Communication Preparation", icon: "/icons/comm-prep.svg" },
  { label: "Postal Mail", icon: "/icons/postal.svg" },
  { label: "Email", icon: "/icons/at.svg" },
  { label: "Portal", icon: "/icons/desktop.svg" },
  { label: "SMS", icon: "/icons/sms.svg" },
  { label: "E-Registered", icon: "/icons/e-registered.svg" },
  { label: "Fax", icon: "/icons/fax.svg" },
  { label: "Archive", icon: "/icons/archive.svg" },
  { label: "E-Invoice", icon: "/icons/variable.svg" },
  { label: "Channel Wizard", icon: "/icons/channel-wizard.svg" },
];

/* ─── TitleBar ─── */

function TitleBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      className="flex flex-col items-start justify-center pb-3"
      style={{ borderBottom: "1px solid #e9e9e9" }}
    >
      <div className="flex w-full items-center pr-6">
        <div className="flex flex-1 flex-col items-start min-w-0">
          <div className="flex flex-col items-start justify-end px-[26px]" style={{ height: 53 }}>
            <span className="text-[22px] font-normal leading-8 truncate" style={{ color: "#212121" }}>
              Jobs
            </span>
          </div>
          <div className="flex flex-col items-start justify-end px-[26px]">
            <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#212121" }}>
              Settings file for creating communications.
            </span>
          </div>
        </div>
        <div className="shrink-0 relative">
          <button
            type="button"
            className="flex items-center justify-center gap-2.5 h-9 pl-3 pr-[26px] rounded-sm cursor-pointer hover:opacity-90 transition-opacity duration-150"
            style={{ backgroundColor: "#2e95be" }}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="relative shrink-0 size-5 overflow-hidden">
              <img src="/icons/add.svg" alt="" className="absolute inset-0 size-full" />
            </div>
            <span className="text-[13px] font-semibold text-center whitespace-nowrap text-white" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              New Job
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div
                className="absolute right-0 z-50 flex flex-col items-start"
                style={{
                  top: "calc(100% + 4px)",
                  backgroundColor: "white",
                  border: "1px solid #cbcbcb",
                  boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)",
                  minWidth: 240,
                }}
              >
                {newJobMenuItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 w-full px-2.5 py-2.5 cursor-pointer hover:bg-black/5 transition-colors duration-100"
                    style={{ height: 40 }}
                  >
                    <div className="relative shrink-0 size-6 overflow-hidden">
                      <img src={item.icon} alt="" className="absolute inset-0 size-full" />
                    </div>
                    <span
                      className="text-[13px] font-semibold italic leading-normal whitespace-nowrap"
                      style={{ color: "#40484b", fontFamily: "'Open Sans', sans-serif" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 items-start px-[26px] w-full pt-[23px]">
        <div className="flex items-center w-full">
          <div
            className="flex flex-1 items-center gap-2.5 pl-[13px] pr-[9px] py-2 min-h-0 min-w-0"
            style={{ height: 35, border: "1px solid #dbdbdb", borderRadius: 2, backgroundColor: "white" }}
          >
            <div className="flex flex-1 items-center min-w-0">
              <div className="flex items-center gap-2.5 shrink-0" style={{ width: 229 }}>
                <div className="relative shrink-0 size-6 overflow-hidden">
                  <img src="/icons/filter-alt.svg" alt="" className="absolute inset-0 size-full" />
                </div>
                <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#747474" }}>
                  Type to search
                </span>
              </div>
            </div>
            <div className="relative shrink-0 size-5 overflow-hidden">
              <img src="/icons/search.svg" alt="" className="absolute inset-0 size-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center shrink-0">
            <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#3a3a39" }}>
              Quick filters:
            </span>
          </div>
          <span
            className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline"
            style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Has Status: <strong>In Progress</strong>
          </span>
          <span
            className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline"
            style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Has Status: <strong>Todo</strong>
          </span>
          <span
            className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline"
            style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Has Object status: <strong>Rejected</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── TabBar ─── */

function TabBar({
  activeTab,
  onTabChange,
  statusCounts,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  statusCounts: Record<string, number>;
}) {
  const tabs = [
    { label: "All", status: null },
    { label: "Drafts", status: "New draft" },
    { label: "Waiting for Approval", status: "Waiting for Approval" },
    { label: "Scheduling", status: "Scheduling" },
    { label: "Submitted", status: "Submitted" },
    { label: "Rejected", status: "Rejected" },
  ];

  return (
    <div className="flex items-end gap-1.5 pr-6" style={{ borderLeft: "1px solid #cfcfcf" }}>
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab;
        const count = tab.status === null
          ? Object.values(statusCounts).reduce((sum, c) => sum + c, 0)
          : statusCounts[tab.status] ?? 0;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onTabChange(tab.label)}
            className="flex items-end shrink-0 outline-none"
            style={{ height: 40, borderRadius: 2 }}
          >
            <div
              className="flex h-full items-center justify-center gap-3 px-5 py-[5px] shrink-0 transition-colors duration-150"
              style={
                isActive
                  ? { backgroundColor: "white", borderTop: "1px solid #d4d4d4", borderRight: "1px solid #d4d4d4", borderLeft: "1px solid #d4d4d4", borderBottom: "1px solid white" }
                  : { backgroundColor: "#f0f0f0", border: "1px solid #d4d4d4" }
              }
            >
              <span
                className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap"
                style={{ color: isActive ? "#2e95be" : "#40484b" }}
              >
                {tab.label}
              </span>
              <span
                className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap"
                style={{ color: isActive ? "#2e95be" : "#40484b" }}
              >
                ({count})
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── ActionToolbar ─── */

function ToolbarButton({
  icon,
  inset,
  label,
  onClick,
  hasDropdown,
  disabled,
}: {
  icon: string;
  inset: string;
  label: string;
  onClick?: () => void;
  hasDropdown?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 transition-opacity duration-150 ${disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:opacity-70"}`}
      onClick={disabled ? undefined : onClick}
    >
      <ToolbarIcon src={icon} inset={inset} />
      <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#40484b" }}>
        {label}
      </span>
      {hasDropdown && (
        <ToolbarIcon src="/icons/arrow-down-small.svg" inset="0" />
      )}
    </div>
  );
}

function ManageTagsDropdown({
  allTags,
  selectedRowTags,
  onToggleTag,
  onCreateTag,
  onClose,
}: {
  allTags: Tag[];
  selectedRowTags: Set<string>;
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const filtered = allTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute left-0 z-50 flex flex-col"
        style={{
          top: "calc(100% + 2px)",
          backgroundColor: "white",
          border: "1px solid #d4d4d4",
          borderRadius: 4,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          width: 280,
        }}
      >
        <div className="px-3 pt-3 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter items"
            className="text-[12px] font-normal outline-none w-full"
            style={{ height: 30, border: "1px solid #d4d4d4", borderRadius: 2, padding: "0 8px", color: "#212121" }}
          />
        </div>

        <div className="flex flex-col overflow-y-auto px-1" style={{ maxHeight: 220 }}>
          {filtered.map((tag) => {
            const isAssigned = selectedRowTags.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm hover:bg-black/5 transition-colors text-left"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => onToggleTag(tag.id)}
              >
                {isAssigned ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <path d="M7 1L12 3V7C12 10 7 13 7 13C7 13 2 10 2 7V3L7 1Z" fill="#098294" stroke="#098294" strokeWidth="0.5" />
                    <path d="M4.5 7L6.5 9L10 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="shrink-0" style={{ width: 14 }} />
                )}
                <span
                  className="inline-flex items-center px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap pointer-events-none"
                  style={{
                    backgroundColor: tag.color,
                    color: "white",
                    border: `1px solid ${tag.color}`,
                    fontFamily: "'Open Sans', sans-serif",
                  }}
                >
                  {tag.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2" style={{ borderTop: "1px solid #e0e0e0" }}>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTagName.trim()) {
                  onCreateTag(newTagName.trim());
                  setNewTagName("");
                }
              }}
              placeholder="Enter new tag"
              className="text-[12px] font-normal outline-none flex-1"
              style={{ height: 28, border: "1px solid #d4d4d4", borderRadius: 2, padding: "0 8px", color: "#212121" }}
            />
            <button
              type="button"
              className="shrink-0 cursor-pointer hover:opacity-60"
              style={{ background: "none", border: "none", padding: 2 }}
              onClick={() => {
                if (newTagName.trim()) {
                  onCreateTag(newTagName.trim());
                  setNewTagName("");
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6.5 12L14 4" stroke="#098294" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 py-2" style={{ borderTop: "1px solid #e0e0e0" }}>
          <Link
            href="/tags-manager"
            className="text-[12px] font-semibold uppercase tracking-wide no-underline hover:underline"
            style={{ color: "#098294" }}
          >
            Manage Tags
          </Link>
        </div>
      </div>
    </>
  );
}

function ActionToolbar({
  selectedCount,
  onClearSelection,
  onAddRemark,
  onOpenInfo,
  onDiscard,
  sidebarOpen,
  allTags,
  selectedRowTags,
  onToggleTag,
  onCreateTag,
}: {
  selectedCount: number;
  onClearSelection: () => void;
  onAddRemark: () => void;
  onOpenInfo: () => void;
  onDiscard: () => void;
  sidebarOpen: boolean;
  allTags: Tag[];
  selectedRowTags: Set<string>;
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string) => void;
}) {
  const [manageTagsOpen, setManageTagsOpen] = useState(false);

  return (
    <div
      className="flex items-center justify-between w-full"
      style={{ backgroundColor: "#f5f5f5", borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderTop: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf" }}
    >
      <div className="flex items-center self-stretch">
        <div className="flex h-full items-center self-stretch">
          <ToolbarButton icon="/icons/send-mails.svg" inset="0" label="Create Campaign" disabled />
          <ToolbarButton icon="/icons/preview.svg" inset="0" label="View" disabled />
          <div className="relative">
            <ToolbarButton
              icon="/icons/tags.svg"
              inset="0"
              label="Manage Tags"
              hasDropdown
              onClick={() => setManageTagsOpen((p) => !p)}
            />
            {manageTagsOpen && (
              <ManageTagsDropdown
                allTags={allTags}
                selectedRowTags={selectedRowTags}
                onToggleTag={onToggleTag}
                onCreateTag={onCreateTag}
                onClose={() => setManageTagsOpen(false)}
              />
            )}
          </div>
          <ToolbarButton icon="/icons/clone.svg" inset="0" label="Clone" disabled />
          <ToolbarButton icon="/icons/discard.svg" inset="0" label="Discard" onClick={onDiscard} />
          <ToolbarButton icon="/icons/comment-icon.svg" inset="0" label="Add remark" onClick={onAddRemark} />
        </div>
      </div>

      <div className="flex items-center shrink-0" style={{ height: 46 }}>
        {selectedCount > 0 && (
          <div className="flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0">
            <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#adadad" }}>
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <button type="button" onClick={onClearSelection} className="outline-none cursor-pointer hover:opacity-70">
              <ToolbarIcon src="/icons/close-small.svg" inset="0" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-center self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70">
          <ToolbarIcon src="/icons/settings.svg?v=2" inset="0" />
        </div>
        <div
          className="flex items-center justify-center self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70"
          style={sidebarOpen ? { backgroundColor: "#e4e4e4" } : undefined}
          onClick={onOpenInfo}
        >
          <ToolbarIcon src="/icons/info.svg" inset="0" />
        </div>
      </div>
    </div>
  );
}

/* ─── Table ─── */

function TableHeader({
  allSelected,
  someSelected,
  onToggleAll,
}: {
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}) {
  const columns = [
    { label: "Job ID", width: 180, align: "left" as const },
    { label: "Tags", width: 180, align: "left" as const },
    { label: "Remarks", width: 120, align: "left" as const },
    { label: "Channel", width: 147, align: "left" as const },
    { label: "Communication Type", width: 180, align: "left" as const },
    { label: "Processing Status", width: 240, align: "left" as const },
    { label: "Team", width: 180, align: "left" as const },
    { label: "Owner", width: 180, align: "left" as const },
    { label: "Job Created", width: undefined, align: "right" as const, flex: true },
  ];

  return (
    <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
      <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={onToggleAll} />
      {columns.map((col) => (
        <div
          key={col.label}
          className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`}
          style={{ width: col.flex ? undefined : col.width }}
        >
          <div className="flex items-center w-full pl-3">
            <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
              <span
                className="text-[13px] font-normal leading-5 truncate block"
                style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}
              >
                {col.label}
              </span>
            </div>
          </div>
          <div className="w-full" style={{ height: 1, backgroundColor: "rgba(33,33,33,0.08)" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── TableRow ─── */

function TableRow({
  row,
  selected,
  hovered,
  onToggleSelect,
  onHover,
  onLeave,
  onRemarkClick,
}: {
  row: JobRowData;
  selected: boolean;
  hovered: boolean;
  onToggleSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  onRemarkClick: () => void;
}) {
  let bg = "white";
  if (selected) bg = "#eeeeee";
  else if (hovered) bg = "#f8f8f8";

  return (
    <div
      className="flex items-start w-full transition-colors duration-100"
      style={{ backgroundColor: bg, borderBottom: "1px solid #dedede" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 32 }}>
        <div className="flex flex-1 items-start pl-3 py-2">
          <div className="flex items-center rounded cursor-pointer" style={{ width: 20, height: 20 }} onClick={onToggleSelect}>
            <div
              className="rounded-sm transition-colors duration-100"
              style={{
                width: 16,
                height: 16,
                margin: 2,
                backgroundColor: selected ? "#2975d6" : "transparent",
                border: selected ? "1px solid #2975d6" : "1px solid #212121",
                position: "relative",
              }}
            >
              {selected && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ position: "absolute", top: 2, left: 1 }}>
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 180 }}>
        <div className="flex items-center pl-3">
          <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>
            {row.jobId}
          </span>
        </div>
      </div>

      <TagsCell tags={row.tags} />

      <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 120 }}>
        <div className="flex items-center pl-3">
          <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 108 }}>
            <RemarkCell count={row.remarks.length} onClick={onRemarkClick} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 147 }}>
        <div className="flex items-center pl-3">
          <ChannelCell icon={row.channelIcon} />
        </div>
      </div>

      <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 180 }}>
        <div className="flex gap-1 items-start px-3 py-2 w-full">
          <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
            {row.communicationType}
          </span>
        </div>
      </div>

      <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 240 }}>
        <div className="flex gap-1 items-start px-3 py-2 w-full">
          <span className="text-[14px] font-normal leading-5 truncate" style={{ color: row.processingStatus === "Rejected" ? "#d42513" : "#3a3a39" }}>
            {row.processingStatus}
          </span>
        </div>
      </div>

      <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 180 }}>
        <div className="flex gap-1 items-start px-3 py-2 w-full">
          <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
            {row.team}
          </span>
        </div>
      </div>

      <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 180 }}>
        <div className="flex gap-1 items-start px-3 py-2 w-full">
          <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
            {row.owner}
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
        <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
          <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>
            {row.jobCreated}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination ─── */

function Pagination() {
  const pages = [1, 2, 3, 4, 5];
  const activePage = 1;
  return (
    <div className="flex items-center justify-end gap-4 px-8 py-2 w-full" style={{ borderTop: "1px solid #d4d4d4", borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf", backgroundColor: "white" }}>
      <div className="flex flex-1 items-start gap-4 py-1 min-w-0" style={{ maxWidth: 1480 }}>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center overflow-hidden shrink-0" style={{ height: 36, border: "1px solid #dbdbdb", borderRadius: 2, backgroundColor: "white" }}>
            <div className="flex items-center overflow-hidden px-2">
              <span className="text-[14px] font-normal leading-5 whitespace-nowrap" style={{ color: "#212121" }}>25 per page</span>
            </div>
            <div className="flex items-start p-2 shrink-0" style={{ width: 36, height: 36 }}>
              <div className="relative shrink-0 size-5 overflow-hidden">
                <img src="/icons/arrow-drop-down.svg" alt="" className="absolute inset-0 size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-0.5 shrink-0" style={{ height: 36 }}>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/first-page.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/chevron-left.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        {pages.map((page, idx) => (
          <div key={page} className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100" style={{ height: 36, minWidth: 36, borderLeft: "1px solid #d4d4d4", borderRight: idx === pages.length - 1 ? "1px solid #d4d4d4" : undefined }}>
            <div className="flex items-center justify-center p-2" style={{ minHeight: 36, maxHeight: 36 }}>
              <span className={`text-[14px] leading-5 whitespace-nowrap px-1 ${page === activePage ? "font-bold" : "font-normal"}`} style={{ color: "#212121" }}>{page}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/chevron-right.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/last-page.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function JobsPage() {
  const [rows, setRows] = useState<JobRowData[]>(initialRows);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["job-1"]));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"information" | "remarks">("remarks");
  const [sidebarRowId, setSidebarRowId] = useState<string | null>(null);

  const [allTags, setAllTags] = useState<Tag[]>(initialTags);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const selectedRowTags = useMemo(() => {
    const tagIds = new Set<string>();
    for (const row of rows) {
      if (selectedIds.has(row.id)) {
        for (const tag of row.tags) tagIds.add(tag.id);
      }
    }
    return tagIds;
  }, [rows, selectedIds]);

  function handleToggleTag(tagId: string) {
    if (selectedIds.size === 0) return;
    const tag = allTags.find((t) => t.id === tagId);
    if (!tag) return;

    const allHaveTag = [...selectedIds].every((id) => {
      const row = rows.find((r) => r.id === id);
      return row?.tags.some((t) => t.id === tagId);
    });

    setRows((prev) =>
      prev.map((r) => {
        if (!selectedIds.has(r.id)) return r;
        if (allHaveTag) {
          return { ...r, tags: r.tags.filter((t) => t.id !== tagId) };
        } else {
          if (r.tags.some((t) => t.id === tagId)) return r;
          return { ...r, tags: [...r.tags, tag] };
        }
      }),
    );
    setSnackbar({ open: true, message: allHaveTag ? `Tag "${tag.name}" removed` : `Tag "${tag.name}" applied` });
  }

  function handleCreateTagInline(name: string) {
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
      usageCount: 0,
      updated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
    setAllTags((prev) => [...prev, newTag]);
    if (selectedIds.size > 0) {
      setRows((prev) =>
        prev.map((r) => (selectedIds.has(r.id) ? { ...r, tags: [...r.tags, newTag] } : r)),
      );
    }
    setSnackbar({ open: true, message: `Tag "${name}" created` });
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.processingStatus] = (counts[row.processingStatus] ?? 0) + 1;
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const statusForTab = TAB_TO_STATUS[activeTab];
    if (!statusForTab) return rows;
    return rows.filter((r) => r.processingStatus === statusForTab);
  }, [activeTab, rows]);

  const allFilteredSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
  const someFilteredSelected = filteredRows.some((r) => selectedIds.has(r.id));

  const sidebarRow = sidebarRowId ? rows.find((r) => r.id === sidebarRowId) ?? null : null;

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const r of filteredRows) next.delete(r.id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const r of filteredRows) next.add(r.id);
        return next;
      });
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function getFirstSelectedRow(): JobRowData | null {
    for (const row of filteredRows) {
      if (selectedIds.has(row.id)) return row;
    }
    return filteredRows[0] ?? null;
  }

  function handleAddRemark() {
    const row = getFirstSelectedRow();
    if (!row) return;
    setSidebarRowId(row.id);
    setSidebarTab("remarks");
    setSidebarOpen(true);
  }

  function handleOpenInfo() {
    const row = getFirstSelectedRow();
    if (!row) return;
    setSidebarRowId(row.id);
    setSidebarTab("information");
    setSidebarOpen(true);
  }

  function handleRemarkClick(rowId: string) {
    setSidebarRowId(rowId);
    setSidebarTab("remarks");
    setSidebarOpen(true);
  }

  function handleCloseSidebar() {
    setSidebarOpen(false);
  }

  function handleDiscard() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    if (sidebarRowId && selectedIds.has(sidebarRowId)) setSidebarOpen(false);
    setSelectedIds(new Set());
    setSnackbar({ open: true, message: `${count} item${count !== 1 ? "s" : ""} discarded` });
  }

  useEffect(() => {
    if (sidebarOpen && sidebarTab === "remarks" && selectedIds.size === 1) {
      const singleId = [...selectedIds][0];
      if (singleId !== sidebarRowId) setSidebarRowId(singleId);
    }
  }, [selectedIds, sidebarOpen, sidebarTab, sidebarRowId]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ open: false, message: "" });
  }, []);

  function handleSubmitRemark(message: string) {
    if (!sidebarRowId) return;
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " " + now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newRemark: Remark = {
      id: `r-${Date.now()}`,
      author: "Me",
      authorType: "user",
      date: formatted,
      message,
    };

    setRows((prev) =>
      prev.map((r) =>
        r.id === sidebarRowId
          ? { ...r, remarks: [newRemark, ...r.remarks] }
          : r,
      ),
    );
    setSnackbar({ open: true, message: "Remark added successfully" });
  }

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 flex-col min-h-0 min-w-0" style={{ backgroundColor: "white" }}>
          <TitleBar />

          <div className="flex flex-1 flex-col min-h-0 overflow-auto" style={{ backgroundColor: "#f5f5f5" }}>
            <div className="flex flex-col px-[26px] pt-[26px] pb-[26px] flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} statusCounts={statusCounts} />
                <ActionToolbar
                  selectedCount={selectedIds.size}
                  onClearSelection={clearSelection}
                  onAddRemark={handleAddRemark}
                  onOpenInfo={handleOpenInfo}
                  onDiscard={handleDiscard}
                  sidebarOpen={sidebarOpen}
                  allTags={allTags}
                  selectedRowTags={selectedRowTags}
                  onToggleTag={handleToggleTag}
                  onCreateTag={handleCreateTagInline}
                />

                <div className="flex flex-1 min-h-0">
                  <div className="flex flex-col flex-1 min-h-0 min-w-0">
                    <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf", backgroundColor: "white" }}>
                      <div className="flex flex-col" style={{ minWidth: 1400 }}>
                        <TableHeader allSelected={allFilteredSelected} someSelected={someFilteredSelected} onToggleAll={toggleAll} />
                        <div className="flex flex-col">
                          {filteredRows.map((row) => (
                            <TableRow
                              key={row.id}
                              row={row}
                              selected={selectedIds.has(row.id)}
                              hovered={hoveredId === row.id}
                              onToggleSelect={() => toggleRow(row.id)}
                              onHover={() => setHoveredId(row.id)}
                              onLeave={() => setHoveredId(null)}
                              onRemarkClick={() => handleRemarkClick(row.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Pagination />
                  </div>

                  <DetailSidebar
                    open={sidebarOpen}
                    activeTab={sidebarTab}
                    onTabChange={setSidebarTab}
                    onClose={handleCloseSidebar}
                    typeName="Job"
                    remarks={sidebarRow?.remarks ?? []}
                    onSubmitRemark={handleSubmitRemark}
                    emptyStateMessage={selectedIds.size > 1 ? "Cannot display remarks for multiple items at once. Please select a single item." : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}
