"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DetailSidebar from "@/components/DetailSidebar";
import SnackbarComponent from "@/components/Snackbar";
import type { Remark } from "@/components/DetailSidebar";
import { initialTags, COLOR_PALETTE } from "@/lib/tags";
import type { Tag } from "@/lib/tags";

/* ─── Types ─── */

type ChannelIcon = "variable" | "archive" | "at" | "desktop";

type InvoiceStatus = "Issued" | "Disputed" | "Paid" | "Closed";

interface RelatedCommunication {
  id: string;
  communicationId: string;
  channelIcon: ChannelIcon;
  generalStatus: string;
  deliveryService: string;
  deliveryStatus: string;
  remarks: Remark[];
  communicationCreated: string;
}

interface InvoiceRowData {
  id: string;
  invoiceNumber: string;
  tags: Tag[];
  remarks: Remark[];
  transactionDirection: "Debit" | "Credit";
  eInvoice: "Yes" | "No";
  status: InvoiceStatus;
  totalAmount: string;
  payableAmount: string;
  remainingAmount: string;
  issueDate: string;
  relatedCommunications: RelatedCommunication[];
}

const TAB_TO_STATUS: Record<string, InvoiceStatus> = {
  Issued: "Issued",
  Disputed: "Disputed",
  Paid: "Paid",
  Closed: "Closed",
};

/* ─── Mock data ─── */

const NEEDS_ATTENTION_TAG: Tag = { id: "needs-attention", name: "Needs Attention", color: "#df4397", usageCount: 0, updated: "" };
const t = initialTags;

const initialRows: InvoiceRowData[] = [
  {
    id: "inv-1", invoiceNumber: "112876583", tags: [], remarks: [
      { id: "r1-1", author: "Author name", authorType: "user", date: "Dec 20, 2026 2:00 PM", message: "Invoice under review for disputed amount." },
    ], transactionDirection: "Debit", eInvoice: "No", status: "Disputed", totalAmount: "\u20AC3,400.50", payableAmount: "\u20AC3,400.50", remainingAmount: "\u20AC3,400.50", issueDate: "Dec 20, 2026",
    relatedCommunications: [
      { id: "rc-1", communicationId: "185854440", channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Suspended", remarks: [
        { id: "rcr-1-1", author: "Author name", authorType: "user", date: "Jan 8, 2025 10:00 AM", message: "Hey, I'm missing the supporting documents for this invoice. Please add them so we can finalize it. Thanks!" },
      ], communicationCreated: "Jan 8, 2025" },
    ],
  },
  {
    id: "inv-2", invoiceNumber: "111870200", tags: [NEEDS_ATTENTION_TAG], remarks: Array.from({ length: 10 }, (_, i) => ({
      id: `r2-${i + 1}`,
      author: i % 2 === 0 ? "Author name" : "System",
      authorType: (i % 2 === 0 ? "user" : "system") as "user" | "system",
      date: "Jan 8, 2025 11:00 AM",
      message: i % 2 === 0 ? `Review note #${i + 1} for disputed invoice.` : "Automated validation check.",
      isError: i % 2 !== 0,
    })), transactionDirection: "Debit", eInvoice: "No", status: "Disputed", totalAmount: "\u20AC51.69", payableAmount: "\u20AC518.99", remainingAmount: "-\u20AC2,000,000,000.00", issueDate: "Jan 08, 2025",
    relatedCommunications: [
      { id: "rc-2a", communicationId: "185854441", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Jan 7, 2025" },
      { id: "rc-2b", communicationId: "185854442", channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", remarks: [
        { id: "rcr-2b-1", author: "System", authorType: "system", date: "Jan 7, 2025 3:00 PM", message: "The service code does not exist in the repository.", isError: true },
      ], communicationCreated: "Jan 7, 2025" },
    ],
  },
  {
    id: "inv-3", invoiceNumber: "111870299", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r3-1", author: "Author name", authorType: "user", date: "Jan 6, 2025 4:00 PM", message: "Dispute raised for incorrect amount." },
      { id: "r3-2", author: "System", authorType: "system", date: "Jan 6, 2025 3:55 PM", message: "Amount mismatch detected.", isError: true },
    ], transactionDirection: "Debit", eInvoice: "Yes", status: "Disputed", totalAmount: "\u20AC10.00", payableAmount: "\u20AC10.00", remainingAmount: "-\u20AC10.00", issueDate: "Jan 06, 2025",
    relatedCommunications: [
      { id: "rc-3", communicationId: "185854443", channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", remarks: [], communicationCreated: "Jan 5, 2025" },
    ],
  },
  {
    id: "inv-4", invoiceNumber: "111870298", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r4-1", author: "Author name", authorType: "user", date: "Jan 5, 2025 2:00 PM", message: "Customer contacted regarding disputed charge." },
    ], transactionDirection: "Debit", eInvoice: "Yes", status: "Disputed", totalAmount: "\u20AC10.00", payableAmount: "\u20AC10.00", remainingAmount: "-\u20AC10.00", issueDate: "Jan 05, 2025",
    relatedCommunications: [
      { id: "rc-4", communicationId: "185854444", channelIcon: "at", generalStatus: "Distributed", deliveryService: "Email Service", deliveryStatus: "Delivered", remarks: [], communicationCreated: "Jan 4, 2025" },
    ],
  },
  {
    id: "inv-5", invoiceNumber: "112543678", tags: [], remarks: [], transactionDirection: "Credit", eInvoice: "Yes", status: "Paid", totalAmount: "\u20AC1,250.00", payableAmount: "\u20AC1,250.00", remainingAmount: "\u20AC0.00", issueDate: "Jan 03, 2025",
    relatedCommunications: [
      { id: "rc-5", communicationId: "185854445", channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", remarks: [], communicationCreated: "Jan 2, 2025" },
    ],
  },
  {
    id: "inv-6", invoiceNumber: "112876543", tags: [], remarks: [], transactionDirection: "Debit", eInvoice: "No", status: "Issued", totalAmount: "\u20AC3,400.50", payableAmount: "\u20AC3,400.50", remainingAmount: "\u20AC3,400.50", issueDate: "Dec 20, 2024",
    relatedCommunications: [
      { id: "rc-6", communicationId: "185854446", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Dec 19, 2024" },
    ],
  },
  {
    id: "inv-7", invoiceNumber: "113245987", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r7-1", author: "Author name", authorType: "user", date: "Dec 15, 2024 10:00 AM", message: "Invoice flagged for review." },
      { id: "r7-2", author: "System", authorType: "system", date: "Dec 15, 2024 9:55 AM", message: "Duplicate reference number detected.", isError: true },
      { id: "r7-3", author: "Author name", authorType: "user", date: "Dec 15, 2024 9:50 AM", message: "Investigating duplicate reference." },
      { id: "r7-4", author: "Author name", authorType: "user", date: "Dec 15, 2024 9:45 AM", message: "Confirmed: not a duplicate, different supplier." },
    ], transactionDirection: "Debit", eInvoice: "Yes", status: "Disputed", totalAmount: "\u20AC875.25", payableAmount: "\u20AC875.25", remainingAmount: "-\u20AC875.25", issueDate: "Dec 15, 2024",
    relatedCommunications: [
      { id: "rc-7", communicationId: "185854447", channelIcon: "variable", generalStatus: "Delivery failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", remarks: [
        { id: "rcr-7-1", author: "System", authorType: "system", date: "Dec 14, 2024 5:00 PM", message: "Delivery failed: recipient address invalid.", isError: true },
      ], communicationCreated: "Dec 14, 2024" },
    ],
  },
  {
    id: "inv-8", invoiceNumber: "114532876", tags: [], remarks: [], transactionDirection: "Credit", eInvoice: "Yes", status: "Closed", totalAmount: "\u20AC2,100.00", payableAmount: "\u20AC2,100.00", remainingAmount: "\u20AC0.00", issueDate: "Dec 10, 2024",
    relatedCommunications: [
      { id: "rc-8", communicationId: "185854448", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Dec 9, 2024" },
    ],
  },
  {
    id: "inv-9", invoiceNumber: "115687432", tags: [], remarks: [], transactionDirection: "Debit", eInvoice: "No", status: "Paid", totalAmount: "\u20AC450.00", payableAmount: "\u20AC450.00", remainingAmount: "\u20AC0.00", issueDate: "Dec 01, 2024",
    relatedCommunications: [
      { id: "rc-9", communicationId: "185854449", channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", remarks: [], communicationCreated: "Nov 30, 2024" },
    ],
  },
  {
    id: "inv-10", invoiceNumber: "116234589", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r10-1", author: "Author name", authorType: "user", date: "Nov 30, 2024 9:00 AM", message: "Escalated: large outstanding balance." },
      { id: "r10-2", author: "System", authorType: "system", date: "Nov 30, 2024 8:55 AM", message: "Payment overdue by 30 days.", isError: true },
    ], transactionDirection: "Debit", eInvoice: "Yes", status: "Disputed", totalAmount: "\u20AC5,670.00", payableAmount: "\u20AC5,670.00", remainingAmount: "-\u20AC5,670.00", issueDate: "Nov 30, 2024",
    relatedCommunications: [
      { id: "rc-10a", communicationId: "185854450", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Nov 29, 2024" },
      { id: "rc-10b", communicationId: "185854451", channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", remarks: [
        { id: "rcr-10b-1", author: "Author name", authorType: "user", date: "Nov 29, 2024 4:00 PM", message: "Customer notified of overdue payment." },
      ], communicationCreated: "Nov 29, 2024" },
    ],
  },
  {
    id: "inv-11", invoiceNumber: "117895432", tags: [], remarks: [], transactionDirection: "Credit", eInvoice: "Yes", status: "Issued", totalAmount: "\u20AC1,890.75", payableAmount: "\u20AC1,890.75", remainingAmount: "\u20AC1,890.75", issueDate: "Nov 28, 2024",
    relatedCommunications: [
      { id: "rc-11", communicationId: "185854452", channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", remarks: [], communicationCreated: "Nov 27, 2024" },
    ],
  },
  {
    id: "inv-12", invoiceNumber: "118234765", tags: [NEEDS_ATTENTION_TAG], remarks: Array.from({ length: 8 }, (_, i) => ({
      id: `r12-${i + 1}`,
      author: i % 3 === 0 ? "System" : "Author name",
      authorType: (i % 3 === 0 ? "system" : "user") as "system" | "user",
      date: "Nov 18, 2024 10:00 AM",
      message: i % 3 === 0 ? "Automated dispute escalation." : `Follow-up note #${i + 1} on disputed invoice.`,
      isError: i % 3 === 0,
    })), transactionDirection: "Debit", eInvoice: "No", status: "Disputed", totalAmount: "\u20AC320.00", payableAmount: "\u20AC320.00", remainingAmount: "-\u20AC320.00", issueDate: "Nov 18, 2024",
    relatedCommunications: [
      { id: "rc-12", communicationId: "185854453", channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", remarks: [
        { id: "rcr-12-1", author: "Author name", authorType: "user", date: "Nov 17, 2024 3:00 PM", message: "Backtracking initiated due to payment dispute." },
        { id: "rcr-12-2", author: "System", authorType: "system", date: "Nov 17, 2024 2:55 PM", message: "Payment validation failed.", isError: true },
      ], communicationCreated: "Nov 17, 2024" },
    ],
  },
  {
    id: "inv-13", invoiceNumber: "119567834", tags: [], remarks: [], transactionDirection: "Debit", eInvoice: "Yes", status: "Closed", totalAmount: "\u20AC780.50", payableAmount: "\u20AC780.50", remainingAmount: "\u20AC0.00", issueDate: "Nov 15, 2024",
    relatedCommunications: [
      { id: "rc-13", communicationId: "185854454", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Nov 14, 2024" },
    ],
  },
  {
    id: "inv-14", invoiceNumber: "120345678", tags: [], remarks: [], transactionDirection: "Credit", eInvoice: "Yes", status: "Paid", totalAmount: "\u20AC4,250.00", payableAmount: "\u20AC4,250.00", remainingAmount: "\u20AC0.00", issueDate: "Oct 22, 2024",
    relatedCommunications: [
      { id: "rc-14", communicationId: "185854455", channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", remarks: [], communicationCreated: "Oct 21, 2024" },
    ],
  },
  {
    id: "inv-15", invoiceNumber: "121876543", tags: [], remarks: Array.from({ length: 21 }, (_, i) => ({
      id: `r15-${i + 1}`,
      author: i % 4 === 0 ? "System" : "Author name",
      authorType: (i % 4 === 0 ? "system" : "user") as "system" | "user",
      date: "Sep 5, 2024 10:00 AM",
      message: i % 4 === 0 ? "Automated payment reminder sent." : `Comment #${i + 1}: Payment follow-up.`,
      isError: i % 4 === 0,
    })), transactionDirection: "Debit", eInvoice: "Yes", status: "Issued", totalAmount: "\u20AC925.75", payableAmount: "\u20AC925.75", remainingAmount: "\u20AC925.75", issueDate: "Sep 05, 2024",
    relatedCommunications: [
      { id: "rc-15a", communicationId: "185854456", channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", remarks: [
        { id: "rcr-15a-1", author: "Author name", authorType: "user", date: "Sep 4, 2024 2:00 PM", message: "Invoice sent to client via e-invoicing portal." },
      ], communicationCreated: "Sep 4, 2024" },
      { id: "rc-15b", communicationId: "185854457", channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", remarks: [], communicationCreated: "Sep 4, 2024" },
    ],
  },
  {
    id: "inv-16", invoiceNumber: "122543987", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r16-1", author: "System", authorType: "system", date: "Aug 25, 2024 4:00 PM", message: "Invoice rejected: missing reference number.", isError: true },
    ], transactionDirection: "Debit", eInvoice: "No", status: "Disputed", totalAmount: "\u20AC1,650.00", payableAmount: "\u20AC1,650.00", remainingAmount: "-\u20AC1,650.00", issueDate: "Aug 25, 2024",
    relatedCommunications: [
      { id: "rc-16", communicationId: "185854458", channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", remarks: [
        { id: "rcr-16-1", author: "System", authorType: "system", date: "Aug 24, 2024 5:00 PM", message: "Processing failed: reference number missing.", isError: true },
      ], communicationCreated: "Aug 24, 2024" },
    ],
  },
  {
    id: "inv-17", invoiceNumber: "123456789", tags: [], remarks: [], transactionDirection: "Credit", eInvoice: "Yes", status: "Paid", totalAmount: "\u20AC560.00", payableAmount: "\u20AC560.00", remainingAmount: "\u20AC0.00", issueDate: "Aug 18, 2024",
    relatedCommunications: [
      { id: "rc-17", communicationId: "185854459", channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", remarks: [], communicationCreated: "Aug 17, 2024" },
    ],
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

function NeedsAttentionTag() {
  return (
    <span
      className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap"
      style={{ backgroundColor: "#df4397", color: "white", border: "1px solid #cc026f", fontFamily: "'Open Sans', sans-serif" }}
    >
      Needs Attention
    </span>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap"
      style={{ backgroundColor: tag.color, color: "white", border: `1px solid ${tag.color}`, fontFamily: "'Open Sans', sans-serif" }}
    >
      {tag.name}
    </span>
  );
}

function TagsCell({ tags }: { tags: Tag[] }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  if (tags.length === 0) return <div className="self-stretch shrink-0" style={{ width: 180 }} />;
  const needsAttention = tags.find((tg) => tg.id === "needs-attention");
  const normalTags = tags.filter((tg) => tg.id !== "needs-attention");
  const visibleTags = normalTags.slice(0, 1);
  const hiddenTags = normalTags.slice(1);
  const hiddenCount = hiddenTags.length;
  function handleMouseEnter(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + 4 });
    setTooltipVisible(true);
  }
  return (
    <div className="flex items-center self-stretch shrink-0 overflow-hidden px-3 py-[6px]" style={{ width: 180, gap: 4 }}>
      {needsAttention && <NeedsAttentionTag />}
      {!needsAttention && visibleTags.map((tg) => <TagBadge key={tg.id} tag={tg} />)}
      {hiddenCount > 0 && (
        <span
          className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap cursor-default"
          style={{ backgroundColor: "#f0f0f0", color: "#3a3a39", border: "1px solid #d4d4d4", fontFamily: "'Open Sans', sans-serif" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          +{hiddenCount}
        </span>
      )}
      {tooltipVisible && hiddenTags.length > 0 && (
        <div className="fixed z-50 flex flex-wrap items-center p-2" style={{ left: tooltipPos.x, top: tooltipPos.y, backgroundColor: "#323232", borderRadius: 4, boxShadow: "0 2px 3px rgba(0,0,0,0.24), 0 1px 3px rgba(0,0,0,0.16)", gap: "6px", maxWidth: 300 }}>
          {hiddenTags.map((tg) => (
            <span key={tg.id} className="inline-flex items-center shrink-0 px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap" style={{ backgroundColor: tg.color, color: "white", border: `1px solid ${tg.color}`, fontFamily: "'Open Sans', sans-serif" }}>
              {tg.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RemarkCell({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return <div className="flex items-start gap-1 px-3 py-2" style={{ width: 120 }} />;
  return (
    <div className="flex items-start gap-1 px-3 py-2 cursor-pointer hover:opacity-70" onClick={onClick}>
      <div className="relative shrink-0 size-5 overflow-hidden">
        <img src="/icons/comment-icon.svg" alt="" className="absolute inset-0 size-full" style={{ opacity: 0.6 }} />
      </div>
      <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>({count})</span>
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

function TreeSwitcher({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="relative shrink-0 size-5 overflow-hidden cursor-pointer transition-transform duration-200"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      <img src="/icons/chevron-right.svg" alt="" className="absolute inset-0 size-full" />
    </div>
  );
}

/* ─── TitleBar ─── */

function TitleBar() {
  return (
    <div className="flex flex-col items-start justify-center pb-3" style={{ borderBottom: "1px solid #e9e9e9" }}>
      <div className="flex w-full items-center pb-6 pr-6">
        <div className="flex flex-1 flex-col items-start min-w-0">
          <div className="flex flex-col items-start justify-end px-[26px]" style={{ height: 53 }}>
            <span className="text-[22px] font-normal leading-8 truncate" style={{ color: "#212121" }}>Invoices</span>
          </div>
          <div className="flex flex-col items-start justify-end px-[26px]">
            <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#212121" }}>They are created based on invoice type communication.</span>
          </div>
        </div>
        <div className="shrink-0" style={{ width: 123, height: 36 }} />
      </div>
      <div className="flex flex-col gap-1.5 items-start px-[26px] w-full">
        <div className="flex items-center w-full">
          <div className="flex flex-1 items-center gap-2.5 pl-[13px] pr-[9px] py-2 min-h-0 min-w-0" style={{ height: 35, border: "1px solid #dbdbdb", borderRadius: 2, backgroundColor: "white" }}>
            <div className="flex flex-1 items-center min-w-0">
              <div className="flex items-center gap-2.5 shrink-0" style={{ width: 229 }}>
                <div className="relative shrink-0 size-6 overflow-hidden"><img src="/icons/filter-alt.svg" alt="" className="absolute inset-0 size-full" /></div>
                <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#747474" }}>Type to search</span>
              </div>
            </div>
            <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/search.svg" alt="" className="absolute inset-0 size-full" /></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center shrink-0"><span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#3a3a39" }}>Quick filters:</span></div>
          <span className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline" style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}>Status: <strong>Overdue</strong></span>
          <span className="text-[12px] leading-4 shrink-0 whitespace-nowrap cursor-pointer hover:underline" style={{ color: "#2e95be", fontFamily: "var(--font-rubik), sans-serif" }}>Has tag: <strong>Need attention</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ─── TabBar ─── */

function TabBar({ activeTab, onTabChange, statusCounts }: { activeTab: string; onTabChange: (tab: string) => void; statusCounts: Record<string, number> }) {
  const tabs = [
    { label: "All", status: null },
    { label: "Issued", status: "Issued" },
    { label: "Disputed", status: "Disputed" },
    { label: "Paid", status: "Paid" },
    { label: "Closed", status: "Closed" },
  ];
  return (
    <div className="flex items-end gap-1.5 pr-6" style={{ borderLeft: "1px solid #cfcfcf" }}>
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab;
        const count = tab.status === null ? Object.values(statusCounts).reduce((s, c) => s + c, 0) : statusCounts[tab.status] ?? 0;
        return (
          <button key={tab.label} type="button" onClick={() => onTabChange(tab.label)} className="flex items-end shrink-0 outline-none" style={{ height: 40, borderRadius: 2 }}>
            <div className="flex h-full items-center justify-center gap-3 px-5 py-[5px] shrink-0 transition-colors duration-150" style={isActive ? { backgroundColor: "white", borderTop: "1px solid #d4d4d4", borderRight: "1px solid #d4d4d4", borderLeft: "1px solid #d4d4d4", borderBottom: "1px solid white" } : { backgroundColor: "#f0f0f0", border: "1px solid #d4d4d4" }}>
              <span className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap" style={{ color: isActive ? "#2e95be" : "#40484b" }}>{tab.label}</span>
              <span className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap" style={{ color: isActive ? "#2e95be" : "#40484b" }}>({count})</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── ActionToolbar ─── */

function ToolbarButton({ icon, inset, label, onClick, hasDropdown, first, disabled }: { icon: string; inset: string; label: string; onClick?: () => void; hasDropdown?: boolean; first?: boolean; disabled?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0 transition-opacity duration-150 ${disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:opacity-70"}`} style={first ? { borderRight: "0.5px solid #cfcfcf" } : undefined} onClick={disabled ? undefined : onClick}>
      <ToolbarIcon src={icon} inset={inset} />
      <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: first ? "#3a3a39" : "#40484b" }}>{label}</span>
      {hasDropdown && <ToolbarIcon src="/icons/arrow-down-small.svg" inset="0" />}
    </div>
  );
}

function ManageTagsDropdown({ allTags, selectedRowTags, onToggleTag, onCreateTag, onClose }: { allTags: Tag[]; selectedRowTags: Set<string>; onToggleTag: (tagId: string) => void; onCreateTag: (name: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const filtered = allTags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 z-50 flex flex-col" style={{ top: "calc(100% + 2px)", backgroundColor: "white", border: "1px solid #d4d4d4", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", width: 280 }}>
        <div className="px-3 pt-3 pb-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter items" className="text-[12px] font-normal outline-none w-full" style={{ height: 30, border: "1px solid #d4d4d4", borderRadius: 2, padding: "0 8px", color: "#212121" }} />
        </div>
        <div className="flex flex-col overflow-y-auto px-1" style={{ maxHeight: 220 }}>
          {filtered.map((tag) => {
            const isAssigned = selectedRowTags.has(tag.id);
            return (
              <button key={tag.id} type="button" className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm hover:bg-black/5 transition-colors text-left" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onToggleTag(tag.id)}>
                {isAssigned ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M7 1L12 3V7C12 10 7 13 7 13C7 13 2 10 2 7V3L7 1Z" fill="#098294" stroke="#098294" strokeWidth="0.5" /><path d="M4.5 7L6.5 9L10 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (<div className="shrink-0" style={{ width: 14 }} />)}
                <span className="inline-flex items-center px-[6px] py-[2px] text-[12px] font-normal leading-[16px] rounded-[2px] whitespace-nowrap pointer-events-none" style={{ backgroundColor: tag.color, color: "white", border: `1px solid ${tag.color}`, fontFamily: "'Open Sans', sans-serif" }}>{tag.name}</span>
              </button>
            );
          })}
        </div>
        <div className="px-3 py-2" style={{ borderTop: "1px solid #e0e0e0" }}>
          <div className="flex items-center gap-1.5">
            <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newTagName.trim()) { onCreateTag(newTagName.trim()); setNewTagName(""); } }} placeholder="Enter new tag" className="text-[12px] font-normal outline-none flex-1" style={{ height: 28, border: "1px solid #d4d4d4", borderRadius: 2, padding: "0 8px", color: "#212121" }} />
            <button type="button" className="shrink-0 cursor-pointer hover:opacity-60" style={{ background: "none", border: "none", padding: 2 }} onClick={() => { if (newTagName.trim()) { onCreateTag(newTagName.trim()); setNewTagName(""); } }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L6.5 12L14 4" stroke="#098294" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        <div className="px-3 py-2" style={{ borderTop: "1px solid #e0e0e0" }}>
          <Link href="/tags-manager" className="text-[12px] font-semibold uppercase tracking-wide no-underline hover:underline" style={{ color: "#098294" }}>Manage Tags</Link>
        </div>
      </div>
    </>
  );
}

function OverflowMenu({ onShowCommunications, onClose }: { onShowCommunications: () => void; onClose: () => void }) {
  const items: { icon: string; label: string; onClick?: () => void; disabled?: boolean }[] = [
    { icon: "/icons/clone.svg", label: "Batch Update", disabled: true },
    { icon: "/icons/clone.svg", label: "Generate Report", disabled: true },
    { icon: "/icons/preview.svg", label: "Invoice History", disabled: true },
    { icon: "/icons/clone.svg", label: "Add Supporting Evidence", disabled: true },
    { icon: "/icons/clone.svg", label: "Resolve Dispute", disabled: true },
    { icon: "/icons/preview.svg", label: "Show submitted communication", onClick: () => { onShowCommunications(); onClose(); } },
    { icon: "/icons/clone.svg", label: "Download metadata", disabled: true },
    { icon: "/icons/discard.svg", label: "Cancel Invoice", disabled: true },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 z-50 flex flex-col" style={{ top: "calc(100% + 2px)", backgroundColor: "white", border: "1px solid #cbcbcb", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)", minWidth: 260 }}>
        {items.map((item) => (
          <div key={item.label} className={`flex items-center gap-3 w-full px-2.5 py-2.5 transition-colors duration-100 ${item.disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:bg-black/5"}`} style={{ height: 40 }} onClick={item.disabled ? undefined : item.onClick}>
            <div className="relative shrink-0 size-6 overflow-hidden"><img src={item.icon} alt="" className="absolute inset-0 size-full" /></div>
            <span className="text-[13px] font-semibold italic leading-normal whitespace-nowrap" style={{ color: "#40484b", fontFamily: "'Open Sans', sans-serif" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ActionToolbar({
  selectedCount, onClearSelection, allExpanded, onToggleExpandAll, onAddRemark, onOpenInfo, sidebarOpen,
  allTags, selectedRowTags, onToggleTag, onCreateTag, onShowCommunications,
}: {
  selectedCount: number; onClearSelection: () => void; allExpanded: boolean; onToggleExpandAll: () => void;
  onAddRemark: () => void; onOpenInfo: () => void; sidebarOpen: boolean;
  allTags: Tag[]; selectedRowTags: Set<string>; onToggleTag: (tagId: string) => void; onCreateTag: (name: string) => void;
  onShowCommunications: () => void;
}) {
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  return (
    <div className="flex items-center justify-between w-full" style={{ backgroundColor: "#f5f5f5", borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderTop: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf" }}>
      <div className="flex items-center self-stretch">
        <div className="flex h-full items-center self-stretch">
          <ToolbarButton icon="/icons/sort.svg" inset="0" label={allExpanded ? "Collapse all" : "Expand all"} first onClick={onToggleExpandAll} />
          <div className="relative">
            <ToolbarButton icon="/icons/tags.svg" inset="0" label="Manage Tags" hasDropdown onClick={() => setManageTagsOpen((p) => !p)} />
            {manageTagsOpen && <ManageTagsDropdown allTags={allTags} selectedRowTags={selectedRowTags} onToggleTag={onToggleTag} onCreateTag={onCreateTag} onClose={() => setManageTagsOpen(false)} />}
          </div>
          <ToolbarButton icon="/icons/comment-icon.svg" inset="0" label="Add remark" onClick={onAddRemark} />
          <div className="relative">
            <div className="flex items-center justify-center self-stretch px-[10px] py-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-150" onClick={() => setOverflowOpen((p) => !p)}>
              <ToolbarIcon src="/icons/more-vert.svg" inset="0" />
            </div>
            {overflowOpen && <OverflowMenu onShowCommunications={onShowCommunications} onClose={() => setOverflowOpen(false)} />}
          </div>
        </div>
      </div>
      <div className="flex items-center shrink-0" style={{ height: 46 }}>
        {selectedCount > 0 && (
          <div className="flex items-center justify-center gap-[7px] self-stretch px-[15px] pr-4 py-4 shrink-0">
            <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: "#adadad" }}>{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected</span>
            <button type="button" onClick={onClearSelection} className="outline-none cursor-pointer hover:opacity-70"><ToolbarIcon src="/icons/close-small.svg" inset="0" /></button>
          </div>
        )}
        <div className="flex items-center justify-center self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70"><ToolbarIcon src="/icons/settings.svg?v=2" inset="0" /></div>
        <div className="flex items-center justify-center self-stretch px-[15px] pr-4 py-4 shrink-0 cursor-pointer hover:opacity-70" style={sidebarOpen ? { backgroundColor: "#e4e4e4" } : undefined} onClick={onOpenInfo}>
          <ToolbarIcon src="/icons/info.svg" inset="0" />
        </div>
      </div>
    </div>
  );
}

/* ─── Table ─── */

function TableHeader({ allSelected, someSelected, onToggleAll }: { allSelected: boolean; someSelected: boolean; onToggleAll: () => void }) {
  const columns = [
    { label: "Invoice Number", width: 180, align: "left" as const, padLeft: 20 },
    { label: "Tags", width: 180, align: "left" as const },
    { label: "Remarks", width: 120, align: "left" as const },
    { label: "Transaction Dire...", width: 120, align: "left" as const },
    { label: "E-Invoice", width: 100, align: "left" as const },
    { label: "Status", width: 120, align: "left" as const },
    { label: "Total Amount with...", width: 140, align: "left" as const },
    { label: "Payable Amount", width: 130, align: "left" as const },
    { label: "Remaining Amount", width: 140, align: "left" as const },
    { label: "Issue Date", width: undefined, align: "right" as const, flex: true },
  ];
  return (
    <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
      <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={onToggleAll} />
      {columns.map((col) => (
        <div key={col.label} className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`} style={{ width: col.flex ? undefined : col.width }}>
          <div className="flex items-center w-full" style={{ paddingLeft: col.padLeft ?? 12 }}>
            <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
              <span className="text-[13px] font-normal leading-5 truncate block" style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}>{col.label}</span>
            </div>
          </div>
          <div className="w-full" style={{ height: 1, backgroundColor: "rgba(33,33,33,0.08)" }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Expanded Section ─── */

function InnerTabButton({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-end shrink-0 outline-none" style={{ height: 36, borderRadius: 2 }}>
      <div className="flex h-full items-center justify-center gap-2 px-4 py-[4px] shrink-0 transition-colors duration-150" style={active ? { backgroundColor: "white", borderTop: "1px solid #d4d4d4", borderRight: "1px solid #d4d4d4", borderLeft: "1px solid #d4d4d4", borderBottom: "1px solid white" } : { backgroundColor: "#f0f0f0", border: "1px solid #d4d4d4" }}>
        <span className="text-[12px] font-semibold leading-normal text-center whitespace-nowrap" style={{ color: active ? "#2e95be" : "#40484b" }}>{label}</span>
        {count !== undefined && <span className="text-[12px] font-semibold leading-normal text-center whitespace-nowrap" style={{ color: active ? "#2e95be" : "#40484b" }}>({count})</span>}
      </div>
    </button>
  );
}

function RelatedCommunicationsTable({ communications }: { communications: RelatedCommunication[] }) {
  const columns = [
    { label: "Communication ID", width: 160, align: "left" as const },
    { label: "Channel", width: 80, align: "left" as const },
    { label: "General Status", width: 140, align: "left" as const },
    { label: "Delivery Service", width: 200, align: "left" as const },
    { label: "Delivery Status", width: 140, align: "left" as const },
    { label: "Remarks", width: 100, align: "left" as const },
    { label: "Communication created", width: undefined, align: "right" as const, flex: true },
  ];
  return (
    <div className="flex flex-col w-full" style={{ border: "1px solid #dedede" }}>
      <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
        {columns.map((col) => (
          <div key={col.label} className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`} style={{ width: col.flex ? undefined : col.width }}>
            <div className="flex items-center w-full pl-3">
              <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
                <span className="text-[12px] font-normal leading-5 truncate block" style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}>{col.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {communications.map((comm) => (
        <div key={comm.id} className="flex items-start w-full" style={{ borderBottom: "1px solid #dedede", backgroundColor: "white" }}>
          <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 160 }}>
            <div className="flex items-center pl-3">
              <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>{comm.communicationId}</span>
            </div>
          </div>
          <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 80 }}>
            <div className="flex items-center pl-3"><ChannelCell icon={comm.channelIcon} /></div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 140 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: comm.generalStatus === "Delivery failed" || comm.generalStatus === "Processing failed" ? "#d42513" : "#3a3a39" }}>{comm.generalStatus}</span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 200 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{comm.deliveryService}</span></div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 140 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{comm.deliveryStatus}</span></div>
          </div>
          <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 100 }}>
            <div className="flex items-center pl-3">
              <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 88 }}>
                {comm.remarks.length > 0 ? (
                  <div className="flex items-start gap-1 px-3 py-2">
                    <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/comment-icon.svg" alt="" className="absolute inset-0 size-full" style={{ opacity: 0.6 }} /></div>
                    <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>({comm.remarks.length})</span>
                  </div>
                ) : <div className="px-3 py-2" />}
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
            <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>{comm.communicationCreated}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedCommunicationRemarksTable({ communications }: { communications: RelatedCommunication[] }) {
  const allRemarks = communications.flatMap((comm) => comm.remarks.map((r) => ({ ...r, communicationId: comm.communicationId })));
  const columns = [
    { label: "Communication ID", width: 160, align: "left" as const },
    { label: "Type", width: 100, align: "left" as const },
    { label: "Code", width: 140, align: "left" as const },
    { label: "Remark Message", width: undefined, align: "left" as const, flex: true },
    { label: "Date", width: 180, align: "right" as const },
  ];
  return (
    <div className="flex flex-col w-full" style={{ border: "1px solid #dedede" }}>
      <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
        {columns.map((col) => (
          <div key={col.label} className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`} style={{ width: col.flex ? undefined : col.width }}>
            <div className="flex items-center w-full pl-3">
              <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
                <span className="text-[12px] font-normal leading-5 truncate block" style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}>{col.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {allRemarks.map((remark) => (
        <div key={remark.id} className="flex items-start w-full" style={{ borderBottom: "1px solid #dedede", backgroundColor: "white" }}>
          <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 160 }}>
            <div className="flex items-center pl-3"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{remark.communicationId}</span></div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 100 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: remark.isError ? "#d42513" : "#3a3a39" }}>{remark.isError ? "Error" : "Remark"}</span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 140 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{remark.isError ? "120: Auto-rejected" : ""}</span>
            </div>
          </div>
          <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 whitespace-pre-wrap break-words" style={{ color: remark.isError ? "#d42513" : "#212121" }}>{remark.message}</span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 180 }}>
            <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>{remark.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpandedSection({ row, innerTab, onInnerTabChange }: { row: InvoiceRowData; innerTab: string; onInnerTabChange: (tab: string) => void }) {
  const totalRemarks = row.relatedCommunications.reduce((sum, c) => sum + c.remarks.length, 0);
  return (
    <div className="flex flex-col w-full" style={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #dedede", borderBottom: "1px solid #dedede", paddingLeft: 32 }}>
      <div className="flex items-end gap-1.5 pt-2" style={{ padding: "8px 24px 0 24px" }}>
        <InnerTabButton label="Related Communications" active={innerTab === "communications"} onClick={() => onInnerTabChange("communications")} />
        <InnerTabButton label="Related Communications Remarks" active={innerTab === "remarks"} count={totalRemarks} onClick={() => onInnerTabChange("remarks")} />
      </div>
      <div style={{ padding: "0 24px 24px 24px" }}>
        {innerTab === "communications" ? (
          <RelatedCommunicationsTable communications={row.relatedCommunications} />
        ) : (
          <RelatedCommunicationRemarksTable communications={row.relatedCommunications} />
        )}
      </div>
    </div>
  );
}

/* ─── TableRow ─── */

function TableRow({
  row, selected, expanded, hovered, innerTab,
  onToggleSelect, onToggleExpand, onHover, onLeave, onRemarkClick, onInnerTabChange,
}: {
  row: InvoiceRowData; selected: boolean; expanded: boolean; hovered: boolean; innerTab: string;
  onToggleSelect: () => void; onToggleExpand: () => void; onHover: () => void; onLeave: () => void;
  onRemarkClick: () => void; onInnerTabChange: (tab: string) => void;
}) {
  let bg = "white";
  if (selected) bg = "#eeeeee";
  else if (hovered) bg = "#f8f8f8";

  const isDisputed = row.status === "Disputed";
  const isNegativeAmount = row.remainingAmount.startsWith("-");
  const totalRemarkCount = row.remarks.length + row.relatedCommunications.reduce((sum, c) => sum + c.remarks.length, 0);

  return (
    <>
      <div className="flex items-start w-full transition-colors duration-100" style={{ backgroundColor: bg, borderBottom: expanded ? undefined : "1px solid #dedede" }} onMouseEnter={onHover} onMouseLeave={onLeave}>
        <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 32 }}>
          <div className="flex flex-1 items-start pl-3 py-2">
            <div className="flex items-center rounded cursor-pointer" style={{ width: 20, height: 20 }} onClick={onToggleSelect}>
              <div className="rounded-sm transition-colors duration-100" style={{ width: 16, height: 16, margin: 2, backgroundColor: selected ? "#2975d6" : "transparent", border: selected ? "1px solid #2975d6" : "1px solid #212121", position: "relative" }}>
                {selected && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ position: "absolute", top: 2, left: 1 }}><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 self-stretch shrink-0 px-3 py-2" style={{ width: 180 }}>
          <TreeSwitcher expanded={expanded} onToggle={onToggleExpand} />
          <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>{row.invoiceNumber}</span>
        </div>

        <TagsCell tags={row.tags} />

        <div className="flex flex-col items-start self-stretch shrink-0" style={{ width: 120 }}>
          <div className="flex items-center pl-3">
            <div className="flex flex-col items-center justify-center overflow-hidden" style={{ width: 108 }}>
              <RemarkCell count={totalRemarkCount} onClick={onRemarkClick} />
            </div>
          </div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 120 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{row.transactionDirection}</span></div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 100 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{row.eInvoice}</span></div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 120 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: isDisputed ? "#d42513" : "#3a3a39" }}>{row.status}</span></div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 140 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{row.totalAmount}</span></div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 130 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>{row.payableAmount}</span></div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 140 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full"><span className="text-[14px] font-normal leading-5 truncate" style={{ color: isNegativeAmount ? "#d42513" : "#3a3a39" }}>{row.remainingAmount}</span></div>
        </div>

        <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
          <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
            <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>{row.issueDate}</span>
          </div>
        </div>
      </div>

      {expanded && <ExpandedSection row={row} innerTab={innerTab} onInnerTabChange={onInnerTabChange} />}
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
            <div className="flex items-center overflow-hidden px-2"><span className="text-[14px] font-normal leading-5 whitespace-nowrap" style={{ color: "#212121" }}>25 per page</span></div>
            <div className="flex items-start p-2 shrink-0" style={{ width: 36, height: 36 }}>
              <div className="relative shrink-0 size-5 overflow-hidden"><img src="/icons/arrow-drop-down.svg" alt="" className="absolute inset-0 size-full" /></div>
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

export default function InvoicesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InvoiceRowData[]>(initialRows);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["inv-1"]));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [innerTabs, setInnerTabs] = useState<Record<string, string>>({});
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
    const tag = allTags.find((tg) => tg.id === tagId);
    if (!tag) return;
    const allHaveTag = [...selectedIds].every((id) => {
      const row = rows.find((r) => r.id === id);
      return row?.tags.some((tg) => tg.id === tagId);
    });
    setRows((prev) =>
      prev.map((r) => {
        if (!selectedIds.has(r.id)) return r;
        if (allHaveTag) return { ...r, tags: r.tags.filter((tg) => tg.id !== tagId) };
        if (r.tags.some((tg) => tg.id === tagId)) return r;
        return { ...r, tags: [...r.tags, tag] };
      }),
    );
    setSnackbar({ open: true, message: allHaveTag ? `Tag "${tag.name}" removed` : `Tag "${tag.name}" applied` });
  }

  function handleCreateTagInline(name: string) {
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const newTag: Tag = { id: `tag-${Date.now()}`, name, color, usageCount: 0, updated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) };
    setAllTags((prev) => [...prev, newTag]);
    if (selectedIds.size > 0) {
      setRows((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, tags: [...r.tags, newTag] } : r)));
    }
    setSnackbar({ open: true, message: `Tag "${name}" created` });
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const status = TAB_TO_STATUS[activeTab];
    if (!status) return rows;
    return rows.filter((r) => r.status === status);
  }, [activeTab, rows]);

  const expandableIds = useMemo(() => new Set(filteredRows.map((r) => r.id)), [filteredRows]);

  const allExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expandedIds.has(id));

  const allFilteredSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
  const someFilteredSelected = filteredRows.some((r) => selectedIds.has(r.id));

  const sidebarRow = sidebarRowId ? rows.find((r) => r.id === sidebarRowId) ?? null : null;

  function toggleRow(id: string) {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => { const next = new Set(prev); for (const r of filteredRows) next.delete(r.id); return next; });
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); for (const r of filteredRows) next.add(r.id); return next; });
    }
  }
  function toggleExpand(id: string) {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function toggleExpandAll() {
    if (allExpanded) {
      setExpandedIds((prev) => { const next = new Set(prev); for (const id of expandableIds) next.delete(id); return next; });
    } else {
      setExpandedIds((prev) => { const next = new Set(prev); for (const id of expandableIds) next.add(id); return next; });
    }
  }
  function setInnerTab(rowId: string, tab: string) {
    setInnerTabs((prev) => ({ ...prev, [rowId]: tab }));
  }
  function clearSelection() { setSelectedIds(new Set()); }

  function getFirstSelectedRow(): InvoiceRowData | null {
    for (const row of filteredRows) { if (selectedIds.has(row.id)) return row; }
    return filteredRows[0] ?? null;
  }
  function handleAddRemark() {
    const row = getFirstSelectedRow();
    if (!row) return;
    setSidebarRowId(row.id); setSidebarTab("remarks"); setSidebarOpen(true);
  }
  function handleOpenInfo() {
    const row = getFirstSelectedRow();
    if (!row) return;
    setSidebarRowId(row.id); setSidebarTab("information"); setSidebarOpen(true);
  }
  function handleRemarkClick(rowId: string) {
    setSidebarRowId(rowId); setSidebarTab("remarks"); setSidebarOpen(true);
  }
  function handleCloseSidebar() { setSidebarOpen(false); }

  function handleShowCommunications() {
    const commIds = new Set<string>();
    for (const row of rows) {
      if (selectedIds.has(row.id)) {
        for (const comm of row.relatedCommunications) {
          commIds.add(comm.communicationId);
        }
      }
    }
    if (commIds.size > 0) {
      router.push(`/production/communications?ids=${[...commIds].join(",")}`);
    } else {
      router.push("/production/communications");
    }
  }

  useEffect(() => {
    if (sidebarOpen && sidebarTab === "remarks" && selectedIds.size === 1) {
      const singleId = [...selectedIds][0];
      if (singleId !== sidebarRowId) setSidebarRowId(singleId);
    }
  }, [selectedIds, sidebarOpen, sidebarTab, sidebarRowId]);

  const handleCloseSnackbar = useCallback(() => { setSnackbar({ open: false, message: "" }); }, []);

  function handleSubmitRemark(message: string) {
    if (!sidebarRowId) return;
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const newRemark: Remark = { id: `r-${Date.now()}`, author: "Me", authorType: "user", date: formatted, message };
    setRows((prev) => prev.map((r) => r.id === sidebarRowId ? { ...r, remarks: [newRemark, ...r.remarks] } : r));
    setSnackbar({ open: true, message: "Remark added successfully" });
  }

  const sidebarRemarks = useMemo(() => {
    if (!sidebarRow) return [];
    const commRemarks = sidebarRow.relatedCommunications.flatMap((c) => c.remarks);
    return [...sidebarRow.remarks, ...commRemarks];
  }, [sidebarRow]);

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
                  selectedCount={selectedIds.size} onClearSelection={clearSelection}
                  allExpanded={allExpanded} onToggleExpandAll={toggleExpandAll}
                  onAddRemark={handleAddRemark} onOpenInfo={handleOpenInfo} sidebarOpen={sidebarOpen}
                  allTags={allTags} selectedRowTags={selectedRowTags} onToggleTag={handleToggleTag} onCreateTag={handleCreateTagInline}
                  onShowCommunications={handleShowCommunications}
                />
                <div className="flex flex-1 min-h-0">
                  <div className="flex flex-col flex-1 min-h-0 min-w-0">
                    <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ borderLeft: "1px solid #cfcfcf", borderRight: "1px solid #cfcfcf", borderBottom: "1px solid #cfcfcf", backgroundColor: "white" }}>
                      <div className="flex flex-col" style={{ minWidth: 1500 }}>
                        <TableHeader allSelected={allFilteredSelected} someSelected={someFilteredSelected} onToggleAll={toggleAll} />
                        <div className="flex flex-col">
                          {filteredRows.map((row) => (
                            <TableRow
                              key={row.id} row={row}
                              selected={selectedIds.has(row.id)} expanded={expandedIds.has(row.id)}
                              hovered={hoveredId === row.id} innerTab={innerTabs[row.id] ?? "communications"}
                              onToggleSelect={() => toggleRow(row.id)} onToggleExpand={() => toggleExpand(row.id)}
                              onHover={() => setHoveredId(row.id)} onLeave={() => setHoveredId(null)}
                              onRemarkClick={() => handleRemarkClick(row.id)}
                              onInnerTabChange={(tab) => setInnerTab(row.id, tab)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Pagination />
                  </div>
                  <DetailSidebar
                    open={sidebarOpen} activeTab={sidebarTab} onTabChange={setSidebarTab}
                    onClose={handleCloseSidebar} typeName="Invoice"
                    remarks={sidebarRemarks}
                    onSubmitRemark={handleSubmitRemark}
                    emptyStateMessage={selectedIds.size > 1 ? "Cannot display remarks for multiple items at once. Please select a single item." : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SnackbarComponent open={snackbar.open} message={snackbar.message} onClose={handleCloseSnackbar} />
    </div>
  );
}
