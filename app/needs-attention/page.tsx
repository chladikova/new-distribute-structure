"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DetailSidebar from "@/components/DetailSidebar";
import SnackbarComponent from "@/components/Snackbar";
import type { Remark, ObjectInfo } from "@/components/DetailSidebar";

interface RowData {
  id: string;
  type: "Communication" | "Invoice" | "Job";
  objectId: string;
  remarks: Remark[];
  date: string;
  info?: ObjectInfo;
  tagRemoved?: boolean;
}

const initialRows: RowData[] = [
  {
    id: "row-1",
    type: "Communication",
    objectId: "185854440",
    date: "Dec 12, 2025 2:00 PM",
    remarks: [
      {
        id: "r1-1",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "Rq 04920955\nCSE for this customer is  013  not on the invoice, make rq\nconcerns order 2102742726 / follow-up to intervention WO-02443166 HU 745424 4200869284",
      },
      {
        id: "r1-2",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "08.07 Following discussion with Ms Céline Bossard, put in CSE CAR or FIR, but the Chorus tool only recognises FIR, ok for payment by customer",
      },
      {
        id: "r1-3",
        author: "System",
        authorType: "system",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "The service code (null) must be entered for the debtor specified in the payment request.",
        isError: true,
      },
      {
        id: "r1-4",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "Dept 33 - Leader Virginie - BORDEAUX COURT OF APPEAL\nConcerns order 2102742519 following intervention WO-02442097 with order form\ncorresponding to EJ and SCE info\n******(on invoice ref: 1512568055 and in SCE DSJPFGU033 ) AND ok SAP",
      },
    ],
    info: {
      incidentType: "Incident (E):",
      incidentDate: "Jul 3, 2025 11:35 AM",
      severity: "Error",
      incident: "120: Auto-rejected",
      description:
        "The invoice number (tag: 2112609137-2) already exists in the system for the specified supplier.",
      clientId: "555",
      deliveryService: "ChorusPro B2G",
    },
  },
  {
    id: "row-2",
    type: "Communication",
    objectId: "185854440",
    date: "Dec 13, 2025 2:15 PM",
    remarks: [
      {
        id: "r2-1",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "Dept 25 - Leader Catherine - Customer DEPARTEMENT DU DOUBS MAIL OFFICE\nConcerns order 2102742391 - on invoice that EJ noted\ntechnical intervention: MSP No. SR: 04876047  dated 02/05/2024 11:58 No. WO:\nWO-02437751 -\nEJ IN REF: 22250001900013 OK on invoice\n- CSE: LOGISTICS NOT ON INVOICE OK WITH IMPRINT",
      },
      {
        id: "r2-2",
        author: "System",
        authorType: "system",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "The service code (AccountingCustomerParty.AccountingContact.ID) does not exist in the service code repository. The repository can be accessed from the portal",
        isError: true,
      },
      {
        id: "r2-3",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "Dept 33 - Leader Virginie - customer PALAIS DE JUSTICE\nConcerns order 2102742616 following intervention WO-02440345\nMAA HZ 103338 QUOTE SIGNED BY M. MARTON on order form\nCOMMITMENT NUMBER in reference: 1406545665\nService (SE code): DSJPFGU033\n*******On the invoice, the EJ and SCE are identical",
      },
      {
        id: "r2-4",
        author: "System",
        authorType: "system",
        date: "Dec 16, 2025 2:58 PM",
        message:
          "The service code (AccountingCustomerParty.AccountingContact.ID) does not exist in the service code repository. The repository can be accessed from the portal.",
        isError: true,
      },
    ],
    info: {
      incidentType: "Incident (E):",
      incidentDate: "Jul 3, 2025 11:35 AM",
      severity: "Error",
      incident: "120: Auto-rejected",
      description:
        "The invoice number (tag: 2112609137-2) already exists in the system for the specified supplier.",
      clientId: "555",
      deliveryService: "ChorusPro B2G",
    },
  },
  {
    id: "row-3",
    type: "Invoice",
    objectId: "185854440",
    date: "Dec 15, 2025 2:45 PM",
    remarks: [
      {
        id: "r3-1",
        author: "Author name",
        authorType: "user",
        date: "Dec 15, 2025 2:45 PM",
        message:
          "- Concerns order 2102742391 - on invoice as noted by EJ\ntechnical intervention: MSP No. SR: 04876047  dated 02/05/2024 11:58 No. WO:\nWO-02437751 - EJ IN REF: 22250001900013 OK on invoice\n- CSE: LOGISTICS NOT ON INVOICE OK WITH IMPRINT",
      },
    ],
    info: {
      incidentType: "Incident (E):",
      incidentDate: "Dec 15, 2025 2:45 PM",
      severity: "Warning",
      incident: "110: Pending review",
      description: "Invoice flagged for manual review due to missing reference.",
      clientId: "412",
      deliveryService: "ChorusPro B2G",
    },
  },
  {
    id: "row-4",
    type: "Job",
    objectId: "188087490",
    date: "Dec 14, 2025 2:30 PM",
    remarks: [
      {
        id: "r4-1",
        author: "Author name",
        authorType: "user",
        date: "Dec 14, 2025 2:30 PM",
        message:
          "This invoice is a duplicate, already paid on 08/07/24 on invoice 0111266118, a credit note 0061661639 has been issued,\n- Concerns order 2102742391 -",
      },
    ],
    info: {
      incidentType: "Incident (E):",
      incidentDate: "Dec 14, 2025 2:30 PM",
      severity: "Error",
      incident: "130: Duplicate detected",
      description: "Duplicate invoice detected. Credit note has been issued.",
      clientId: "789",
      deliveryService: "ChorusPro B2G",
    },
  },
  {
    id: "row-5",
    type: "Job",
    objectId: "188087486",
    date: "Dec 16, 2025 3:00 PM",
    remarks: [
      {
        id: "r5-1",
        author: "Author name",
        authorType: "user",
        date: "Dec 16, 2025 3:00 PM",
        message:
          "Dept 93 - COMMUNE DE GAGNY\nConcerns order 2102742168\n******on invoice NO INFORMATION IN SAP ok with information from Impress\nTechnical intervention WO-02438847 with order no. CA240002 -",
      },
    ],
    info: {
      incidentType: "Incident (E):",
      incidentDate: "Dec 16, 2025 3:00 PM",
      severity: "Error",
      incident: "120: Auto-rejected",
      description: "No matching information found in SAP system.",
      clientId: "321",
      deliveryService: "ChorusPro B2G",
    },
  },
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

/* ─── TitleBar ─── */

function TitleBar() {
  return (
    <div
      className="flex flex-col items-start justify-center pb-3"
      style={{ borderBottom: "1px solid #e9e9e9" }}
    >
      <div className="flex w-full items-center pb-6 pr-6">
        <div className="flex flex-1 flex-col items-start min-w-0">
          <div className="flex flex-col items-start justify-end px-[26px]" style={{ height: 53 }}>
            <span className="text-[22px] font-normal leading-8 truncate" style={{ color: "#212121" }}>
              Needs Attention
            </span>
          </div>
          <div className="flex flex-col items-start justify-end px-[26px]">
            <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#212121" }}>
              Your queue of Needs attention items
            </span>
          </div>
        </div>
        <div className="shrink-0" style={{ width: 123, height: 36 }} />
      </div>

      <div className="flex flex-col gap-1.5 items-start px-[26px] w-full">
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
            Date: <strong>This month</strong>
          </span>
          <span
            className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline"
            style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Date: <strong>Last month</strong>
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
  counts,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}) {
  const tabs = [
    { label: "All", count: null },
    { label: "Job", count: counts["Job"] ?? 0 },
    { label: "Communication", count: counts["Communication"] ?? 0 },
    { label: "Invoice", count: counts["Invoice"] ?? 0 },
  ];

  return (
    <div className="flex items-end gap-1.5 pr-6" style={{ borderLeft: "1px solid #cfcfcf" }}>
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab;
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
                  ? { backgroundColor: "white", borderTop: "1px solid #d4d4d4", borderRight: "1px solid #d4d4d4", borderBottom: "1px solid white" }
                  : { backgroundColor: "#f0f0f0", border: "1px solid #d4d4d4" }
              }
            >
              <span
                className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap"
                style={{ color: isActive ? "#2e95be" : "#40484b" }}
              >
                {tab.label}
              </span>
              {tab.count !== null && (
                <span
                  className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap"
                  style={{ color: isActive ? "#2e95be" : "#40484b" }}
                >
                  ({tab.count})
                </span>
              )}
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
  first,
  onClick,
  disabled,
}: {
  icon: string;
  inset: string;
  label: string;
  first?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 transition-opacity duration-150 ${disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:opacity-70"}`}
      style={first ? { borderRight: "0.5px solid #cfcfcf" } : undefined}
      onClick={disabled ? undefined : onClick}
    >
      <ToolbarIcon src={icon} inset={inset} />
      <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: first ? "#3a3a39" : "#40484b" }}>
        {label}
      </span>
    </div>
  );
}

function ActionToolbar({
  selectedCount,
  onClearSelection,
  allExpanded,
  onToggleExpandAll,
  onUnassignTag,
  onAddRemark,
  onOpenInfo,
  sidebarOpen,
}: {
  selectedCount: number;
  onClearSelection: () => void;
  allExpanded: boolean;
  onToggleExpandAll: () => void;
  onUnassignTag: () => void;
  onAddRemark: () => void;
  onOpenInfo: () => void;
  sidebarOpen: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between w-full"
      style={{ backgroundColor: "#f5f5f5", borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderTop: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf" }}
    >
      <div className="flex items-center self-stretch">
        <div className="flex h-full items-center self-stretch">
          <ToolbarButton
            icon="/icons/sort.svg"
            inset="0"
            label={allExpanded ? "Collapse all" : "Expand all"}
            first
            onClick={onToggleExpandAll}
          />
          <ToolbarButton icon="/icons/preview-document.svg" inset="0" label="View object" disabled />
          <ToolbarButton icon="/icons/delete.svg" inset="0" label="Unassigned tag" onClick={onUnassignTag} />
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
        <div
          className="flex items-center justify-center self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70"
        >
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
    { label: "Type", width: 180, minWidth: 180, align: "left" as const },
    { label: "ID", width: 120, minWidth: 120, align: "left" as const },
    { label: "Tags", width: 180, minWidth: 180, align: "left" as const },
    { label: "Remarks", width: 120, minWidth: 120, align: "left" as const },
    { label: "Author", width: 180, minWidth: 180, align: "left" as const, borderLeft: true },
    { label: "Remark Message", width: undefined, minWidth: 220, align: "left" as const, flex: true },
    { label: "Date", width: 180, minWidth: 180, align: "right" as const },
  ];

  return (
    <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
      <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={onToggleAll} />
      {columns.map((col) => (
        <div
          key={col.label}
          className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`}
          style={{ width: col.flex ? undefined : col.width, minWidth: col.minWidth, borderLeft: col.borderLeft ? "1px solid #dedede" : undefined }}
        >
          <div className="flex items-center w-full" style={{ paddingLeft: col.label === "Type" ? 20 : 12 }}>
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

function TreeSwitcher({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="relative shrink-0 size-5 overflow-hidden cursor-pointer transition-transform duration-200"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <img src="/icons/chevron-right.svg" alt="" className="absolute inset-0 size-full" />
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

/* ─── Sub-row for expanded remarks ─── */

function SubRemarkRow({ remark, isLast }: { remark: Remark; isLast: boolean }) {
  return (
    <div
      className="flex items-start w-full"
      style={{
        backgroundColor: "white",
        borderBottom: isLast ? undefined : "1px solid #dedede",
        paddingLeft: 32,
      }}
    >
      <div className="flex flex-1 items-start min-w-0">
        {/* Empty Type column (indented) */}
        <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 180, minWidth: 180 }} />

        {/* Empty ID column */}
        <div className="flex flex-col items-start self-stretch shrink-0 pl-6 pr-3 py-2" style={{ width: 120, minWidth: 120 }} />

        {/* Empty Tags column */}
        <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 180, minWidth: 180 }} />

        {/* Empty Remarks column */}
        <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 120, minWidth: 120 }} />

        {/* Author + Message + Date */}
        <div className="flex flex-1 items-start min-w-0 self-stretch">
          <div className="flex flex-col self-stretch shrink-0" style={{ width: 180, minWidth: 180, borderLeft: "1px solid #dedede" }}>
            <div className="flex items-center pl-3">
              <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 180 }}>
                <div className="flex items-start gap-1 w-full px-3 py-2">
                  <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                    {remark.author}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-start min-w-0 pr-3" style={{ minWidth: 400 }}>
            <div className="flex flex-1 flex-col gap-2 items-start justify-center min-w-0 pl-6 pr-3 py-2" style={{ minHeight: 37, minWidth: 220 }}>
              <div className="w-full">
                <p
                  className="text-[14px] font-normal leading-5 whitespace-pre-wrap break-words"
                  style={{ color: remark.isError ? "#e34243" : "#212121", margin: 0 }}
                >
                  {remark.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center self-stretch shrink-0" style={{ width: 180, minWidth: 180 }}>
              <span
                className="flex-1 text-[14px] font-normal leading-5 truncate text-right w-full flex items-start justify-end py-2 pr-3"
                style={{ color: "#212121" }}
              >
                {remark.date}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TableRow ─── */

function TableRow({
  row,
  selected,
  expanded,
  hovered,
  onToggleSelect,
  onToggleExpand,
  onHover,
  onLeave,
  onRemarkClick,
}: {
  row: RowData;
  selected: boolean;
  expanded: boolean;
  hovered: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onHover: () => void;
  onLeave: () => void;
  onRemarkClick: () => void;
}) {
  let bg = "white";
  if (selected) bg = "#eeeeee";
  else if (hovered) bg = "#f8f8f8";

  const hasMultipleRemarks = row.remarks.length > 1;
  const firstRemark = row.remarks[0];

  return (
    <>
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

        <div className="flex flex-1 items-start min-w-0">
          <div className="flex items-start gap-2 self-stretch shrink-0 px-3 py-2" style={{ width: 180, minWidth: 180 }}>
            {hasMultipleRemarks ? (
              <TreeSwitcher expanded={expanded} onToggle={onToggleExpand} />
            ) : (
              <div className="shrink-0 size-5" />
            )}
            <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
              {row.type}
            </span>
          </div>

          <div className="flex flex-col gap-2 items-start self-stretch shrink-0 pl-6 pr-3 py-2" style={{ width: 120, minWidth: 120 }}>
            <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>
              {row.objectId}
            </span>
          </div>

          <div className="flex items-start gap-1 self-stretch shrink-0 px-3 py-2" style={{ width: 180, minWidth: 180 }}>
            {!row.tagRemoved && <NeedsAttentionTag />}
          </div>

          <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 120, minWidth: 120 }}>
            <div className="flex items-center pl-3">
              <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 108 }}>
                <RemarkCell count={row.remarks.length} onClick={onRemarkClick} />
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-start min-w-0 self-stretch" style={{ borderBottom: "1px solid #dedede" }}>
            <div className="flex flex-col self-stretch shrink-0" style={{ width: 180, minWidth: 180, borderLeft: "1px solid #dedede" }}>
              <div className="flex items-center pl-3">
                <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 180 }}>
                  <div className="flex items-start gap-1 w-full px-3 py-2">
                    <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                      {firstRemark?.author ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-start min-w-0 pr-3" style={{ minWidth: 400 }}>
              <div className="flex flex-1 flex-col gap-2 items-start justify-center min-w-0 pl-6 pr-3 py-2" style={{ minHeight: 37, minWidth: 220 }}>
                <div className="w-full">
                  <p
                    className="text-[14px] font-normal leading-5 whitespace-pre-wrap break-words"
                    style={{ color: firstRemark?.isError ? "#e34243" : "#212121", margin: 0 }}
                  >
                    {firstRemark
                      ? expanded
                        ? firstRemark.message
                        : firstRemark.message.split("\n").slice(0, 3).join("\n")
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center self-stretch shrink-0" style={{ width: 180, minWidth: 180 }}>
                <span
                  className="flex-1 text-[14px] font-normal leading-5 truncate text-right w-full flex items-start justify-end py-2 pr-3"
                  style={{ color: "#212121" }}
                >
                  {row.date}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded sub-rows */}
      {expanded && hasMultipleRemarks && row.remarks.slice(1).map((remark, idx) => (
        <SubRemarkRow
          key={remark.id}
          remark={remark}
          isLast={idx === row.remarks.length - 2}
        />
      ))}
    </>
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

export default function NeedsAttentionPage() {
  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["row-1"]));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"information" | "remarks">("remarks");
  const [sidebarRowId, setSidebarRowId] = useState<string | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.type] = (counts[row.type] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const filteredRows = useMemo(
    () => (activeTab === "All" ? rows : rows.filter((r) => r.type === activeTab)),
    [activeTab, rows],
  );

  const expandableIds = useMemo(
    () => new Set(filteredRows.filter((r) => r.remarks.length > 1).map((r) => r.id)),
    [filteredRows],
  );

  const allExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expandedIds.has(id));

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

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpandAll() {
    if (allExpanded) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of expandableIds) next.delete(id);
        return next;
      });
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of expandableIds) next.add(id);
        return next;
      });
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function getFirstSelectedRow(): RowData | null {
    for (const row of filteredRows) {
      if (selectedIds.has(row.id)) return row;
    }
    return filteredRows[0] ?? null;
  }

  function handleUnassignTag() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setRows((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, tagRemoved: true } : r,
      ),
    );
    setSelectedIds(new Set());
    setSnackbar({ open: true, message: `Tag removed from ${count} item${count !== 1 ? "s" : ""}` });
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
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={typeCounts} />
                <ActionToolbar
                  selectedCount={selectedIds.size}
                  onClearSelection={clearSelection}
                  allExpanded={allExpanded}
                  onToggleExpandAll={toggleExpandAll}
                  onUnassignTag={handleUnassignTag}
                  onAddRemark={handleAddRemark}
                  onOpenInfo={handleOpenInfo}
                  sidebarOpen={sidebarOpen}
                />

                <div className="flex flex-1 min-h-0">
                  {/* Table body + pagination */}
                  <div className="flex flex-col flex-1 min-h-0 min-w-0">
                    <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf", backgroundColor: "white" }}>
                      <div className="flex flex-col" style={{ minWidth: 1212 }}>
                        <TableHeader allSelected={allFilteredSelected} someSelected={someFilteredSelected} onToggleAll={toggleAll} />
                        <div className="flex flex-col">
                          {filteredRows.map((row) => (
                            <TableRow
                              key={row.id}
                              row={row}
                              selected={selectedIds.has(row.id)}
                              expanded={expandedIds.has(row.id)}
                              hovered={hoveredId === row.id}
                              onToggleSelect={() => toggleRow(row.id)}
                              onToggleExpand={() => toggleExpand(row.id)}
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

                  {/* Detail Sidebar */}
                  <DetailSidebar
                    open={sidebarOpen}
                    activeTab={sidebarTab}
                    onTabChange={setSidebarTab}
                    onClose={handleCloseSidebar}
                    typeName={sidebarRow?.type ?? ""}
                    remarks={sidebarRow?.remarks ?? []}
                    info={sidebarRow?.info}
                    onSubmitRemark={handleSubmitRemark}
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
