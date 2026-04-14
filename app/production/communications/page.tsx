"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Img from "@/components/Img";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DetailSidebar from "@/components/DetailSidebar";
import SnackbarComponent from "@/components/Snackbar";
import type { Remark } from "@/components/DetailSidebar";
import { initialTags, COLOR_PALETTE, NEEDS_ATTENTION_TAG } from "@/lib/tags";
import type { Tag } from "@/lib/tags";

/* ─── Types ─── */

type ChannelIcon = "variable" | "archive" | "at" | "desktop";

type GeneralStatus = "Delivery failed" | "Finished" | "Processing failed" | "Distributed" | "Backtracking stop";

type TabLabel = "All" | "Preprocessing" | "Transmitted" | "Processing" | "Finished";

interface Invoice {
  id: string;
  invoiceNumber: string;
  tags: Tag[];
  transactionType: string;
  status: string;
  issueDate: string;
}

interface CommunicationRowData {
  id: string;
  communicationId: string;
  tags: Tag[];
  remarks: Remark[];
  channelIcon: ChannelIcon;
  generalStatus: GeneralStatus;
  deliveryService: string;
  deliveryStatus: string;
  communicationCreated: string;
  relatedInvoices: Invoice[];
}

const TAB_TO_STATUS: Record<string, GeneralStatus[]> = {
  Preprocessing: ["Distributed"],
  Transmitted: ["Delivery failed", "Processing failed"],
  Processing: ["Backtracking stop"],
  Finished: ["Finished"],
};

/* ─── Mock data ─── */

const OVERDUE_TAG: Tag = { id: "overdue", name: "overdue", color: "#e65100", usageCount: 0, updated: "" };
const t = initialTags;

const initialRows: CommunicationRowData[] = [
  {
    id: "comm-1", communicationId: "185854440", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r1-1", author: "Author name", authorType: "user", date: "Jan 6, 2026 9:41 AM", message: "The service code (AccountingCustomerParty.AccountingContact.ID) does not exist in the service code repository. The repository can be accessed from the portal" },
    ], channelIcon: "variable", generalStatus: "Delivery failed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sending to PA failed", communicationCreated: "Jan 6, 2026 5:00 PM",
    relatedInvoices: [{ id: "inv-1", invoiceNumber: "117895432", tags: [OVERDUE_TAG], transactionType: "Credit", status: "Issued", issueDate: "Nov 28, 2024" }],
  },
  {
    id: "comm-2", communicationId: "185871693", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Jan 6, 2026 4:41 PM",
    relatedInvoices: [],
  },
  {
    id: "comm-3", communicationId: "184571205", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r3-1", author: "Author name", authorType: "user", date: "Dec 16, 2025 2:58 PM", message: "Rq 04920955\nCSE for this customer is 013 not on the invoice, make rq\nconcerns order 2102742726" },
      { id: "r3-2", author: "System", authorType: "system", date: "Dec 16, 2025 2:58 PM", message: "The service code (null) must be entered for the debtor specified in the payment request.", isError: true },
      { id: "r3-3", author: "Author name", authorType: "user", date: "Dec 16, 2025 2:50 PM", message: "Dept 25 - Leader Catherine - Customer DEPARTEMENT DU DOUBS\nConcerns order 2102742391" },
      { id: "r3-4", author: "System", authorType: "system", date: "Dec 16, 2025 2:45 PM", message: "The service code (AccountingCustomerParty.AccountingContact.ID) does not exist in the service code repository.", isError: true },
    ], channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", communicationCreated: "Dec 16, 2025 2:58 PM",
    relatedInvoices: [{ id: "inv-3", invoiceNumber: "117895500", tags: [], transactionType: "Debit", status: "Pending", issueDate: "Dec 10, 2025" }],
  },
  {
    id: "comm-4", communicationId: "184691978", tags: [], remarks: [], channelIcon: "at", generalStatus: "Distributed", deliveryService: "Barca System SP", deliveryStatus: "First opened", communicationCreated: "Dec 1, 2025 12:28 PM",
    relatedInvoices: [],
  },
  {
    id: "comm-5", communicationId: "184571205", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 15, 2025 6:30 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-6", communicationId: "184571205", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 15, 2025 5:51 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-7", communicationId: "184571205", tags: [], remarks: [
      { id: "r7-1", author: "Author name", authorType: "user", date: "Oct 15, 2025 4:40 AM", message: "Payment confirmed by bank transfer." },
    ], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 15, 2025 4:40 AM",
    relatedInvoices: [{ id: "inv-7", invoiceNumber: "117895610", tags: [], transactionType: "Credit", status: "Yes", issueDate: "Oct 10, 2025" }],
  },
  {
    id: "comm-8", communicationId: "184571205", tags: [], remarks: [
      { id: "r8-1", author: "Author name", authorType: "user", date: "Oct 15, 2025 3:54 AM", message: "Payment received confirmation sent." },
    ], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 15, 2025 3:54 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-9", communicationId: "184571205", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 15, 2025 3:47 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-10", communicationId: "179745701", tags: [], remarks: [
      { id: "r10-1", author: "Author name", authorType: "user", date: "Oct 10, 2025 10:18 AM", message: "Backtracking initiated due to address mismatch." },
      { id: "r10-2", author: "System", authorType: "system", date: "Oct 10, 2025 10:15 AM", message: "Address validation error: postal code mismatch.", isError: true },
      { id: "r10-3", author: "Author name", authorType: "user", date: "Oct 10, 2025 10:10 AM", message: "Investigating address data source." },
      { id: "r10-4", author: "Author name", authorType: "user", date: "Oct 10, 2025 10:05 AM", message: "Customer contacted for address verification." },
      { id: "r10-5", author: "Author name", authorType: "user", date: "Oct 10, 2025 10:00 AM", message: "Escalated to support team." },
      { id: "r10-6", author: "System", authorType: "system", date: "Oct 10, 2025 9:55 AM", message: "Retry attempt failed: connection timeout.", isError: true },
      { id: "r10-7", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:50 AM", message: "Second retry scheduled." },
      { id: "r10-8", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:45 AM", message: "Waiting for customer response." },
      { id: "r10-9", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:40 AM", message: "Customer confirmed new address." },
      { id: "r10-10", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:35 AM", message: "Address updated in system." },
      { id: "r10-11", author: "System", authorType: "system", date: "Oct 10, 2025 9:30 AM", message: "Reprocessing with updated address.", isError: false },
      { id: "r10-12", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:25 AM", message: "Delivery reattempted." },
      { id: "r10-13", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:20 AM", message: "Delivery successful on retry." },
      { id: "r10-14", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:15 AM", message: "Case closed." },
      { id: "r10-15", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:10 AM", message: "Final verification complete." },
      { id: "r10-16", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:05 AM", message: "Documentation archived." },
      { id: "r10-17", author: "Author name", authorType: "user", date: "Oct 10, 2025 9:00 AM", message: "Process review scheduled." },
      { id: "r10-18", author: "Author name", authorType: "user", date: "Oct 10, 2025 8:55 AM", message: "Review complete." },
      { id: "r10-19", author: "Author name", authorType: "user", date: "Oct 10, 2025 8:50 AM", message: "Improvements noted." },
      { id: "r10-20", author: "Author name", authorType: "user", date: "Oct 10, 2025 8:45 AM", message: "Ticket closed." },
      { id: "r10-21", author: "Author name", authorType: "user", date: "Oct 10, 2025 8:40 AM", message: "Summary sent to management." },
    ], channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", communicationCreated: "Oct 10, 2025 10:18 AM",
    relatedInvoices: [{ id: "inv-10a", invoiceNumber: "117895700", tags: [], transactionType: "Debit", status: "Issued", issueDate: "Oct 5, 2025" }, { id: "inv-10b", invoiceNumber: "117895701", tags: [OVERDUE_TAG], transactionType: "Credit", status: "Pending", issueDate: "Oct 8, 2025" }],
  },
  {
    id: "comm-11", communicationId: "179745701", tags: [], remarks: [], channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", communicationCreated: "Oct 10, 2025 9:52 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-12", communicationId: "179745701", tags: [], remarks: Array.from({ length: 40 }, (_, i) => ({
      id: `r12-${i + 1}`,
      author: i % 3 === 0 ? "System" : "Author name",
      authorType: (i % 3 === 0 ? "system" : "user") as "system" | "user",
      date: "Oct 10, 2025 8:42 AM",
      message: i % 3 === 0 ? "Automated validation check failed." : `Comment #${i + 1}: Review note for backtracking job.`,
      isError: i % 3 === 0,
    })), channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", communicationCreated: "Oct 10, 2025 8:42 AM",
    relatedInvoices: [],
  },
  {
    id: "comm-13", communicationId: "179745701", tags: [], remarks: [], channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", communicationCreated: "Oct 8, 2025 1:44 PM",
    relatedInvoices: [],
  },
  {
    id: "comm-14", communicationId: "185871693", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Sep 24, 2025 12:30 PM",
    relatedInvoices: [],
  },
  {
    id: "comm-15", communicationId: "185871693", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Sep 24, 2025 12:30 PM",
    relatedInvoices: [],
  },
  {
    id: "comm-16", communicationId: "184571205", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r16-1", author: "System", authorType: "system", date: "Sep 3, 2025 4:46 PM", message: "Processing failed: invalid recipient address.", isError: true },
    ], channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", communicationCreated: "Sep 3, 2025 4:46 PM",
    relatedInvoices: [{ id: "inv-16", invoiceNumber: "117895800", tags: [], transactionType: "Debit", status: "Issued", issueDate: "Sep 1, 2025" }],
  },
  {
    id: "comm-17", communicationId: "185854441", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Jan 7, 2025 4:00 PM",
    relatedInvoices: [{ id: "inv-i2", invoiceNumber: "111870200", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Jan 08, 2025" }],
  },
  {
    id: "comm-18", communicationId: "185854442", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r18-1", author: "System", authorType: "system", date: "Jan 7, 2025 3:00 PM", message: "The service code does not exist in the repository.", isError: true },
    ], channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", communicationCreated: "Jan 7, 2025 3:00 PM",
    relatedInvoices: [{ id: "inv-i2b", invoiceNumber: "111870200", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Jan 08, 2025" }],
  },
  {
    id: "comm-19", communicationId: "185854443", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", communicationCreated: "Jan 5, 2025 2:30 PM",
    relatedInvoices: [{ id: "inv-i3", invoiceNumber: "111870299", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Jan 06, 2025" }],
  },
  {
    id: "comm-20", communicationId: "185854444", tags: [], remarks: [], channelIcon: "at", generalStatus: "Distributed", deliveryService: "Email Service", deliveryStatus: "Delivered", communicationCreated: "Jan 4, 2025 10:15 AM",
    relatedInvoices: [{ id: "inv-i4", invoiceNumber: "111870298", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Jan 05, 2025" }],
  },
  {
    id: "comm-21", communicationId: "185854445", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Jan 2, 2025 9:00 AM",
    relatedInvoices: [{ id: "inv-i5", invoiceNumber: "112543678", tags: [], transactionType: "Credit", status: "Paid", issueDate: "Jan 03, 2025" }],
  },
  {
    id: "comm-22", communicationId: "185854446", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Dec 19, 2024 3:45 PM",
    relatedInvoices: [{ id: "inv-i6", invoiceNumber: "112876543", tags: [], transactionType: "Debit", status: "Issued", issueDate: "Dec 20, 2024" }],
  },
  {
    id: "comm-23", communicationId: "185854447", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r23-1", author: "System", authorType: "system", date: "Dec 14, 2024 5:00 PM", message: "Delivery failed: recipient address invalid.", isError: true },
    ], channelIcon: "variable", generalStatus: "Delivery failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", communicationCreated: "Dec 14, 2024 5:00 PM",
    relatedInvoices: [{ id: "inv-i7", invoiceNumber: "113245987", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Dec 15, 2024" }],
  },
  {
    id: "comm-24", communicationId: "185854448", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Dec 9, 2024 1:20 PM",
    relatedInvoices: [{ id: "inv-i8", invoiceNumber: "114532876", tags: [], transactionType: "Credit", status: "Closed", issueDate: "Dec 10, 2024" }],
  },
  {
    id: "comm-25", communicationId: "185854449", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Nov 30, 2024 11:00 AM",
    relatedInvoices: [{ id: "inv-i9", invoiceNumber: "115687432", tags: [], transactionType: "Debit", status: "Paid", issueDate: "Dec 01, 2024" }],
  },
  {
    id: "comm-26", communicationId: "185854450", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Nov 29, 2024 2:00 PM",
    relatedInvoices: [{ id: "inv-i10a", invoiceNumber: "116234589", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Nov 30, 2024" }],
  },
  {
    id: "comm-27", communicationId: "185854451", tags: [], remarks: [
      { id: "r27-1", author: "Author name", authorType: "user", date: "Nov 29, 2024 4:00 PM", message: "Customer notified of overdue payment." },
    ], channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", communicationCreated: "Nov 29, 2024 4:00 PM",
    relatedInvoices: [{ id: "inv-i10b", invoiceNumber: "116234589", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Nov 30, 2024" }],
  },
  {
    id: "comm-28", communicationId: "185854452", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", communicationCreated: "Nov 27, 2024 8:30 AM",
    relatedInvoices: [{ id: "inv-i11", invoiceNumber: "117895432", tags: [], transactionType: "Credit", status: "Issued", issueDate: "Nov 28, 2024" }],
  },
  {
    id: "comm-29", communicationId: "185854453", tags: [], remarks: [
      { id: "r29-1", author: "Author name", authorType: "user", date: "Nov 17, 2024 3:00 PM", message: "Backtracking initiated due to payment dispute." },
      { id: "r29-2", author: "System", authorType: "system", date: "Nov 17, 2024 2:55 PM", message: "Payment validation failed.", isError: true },
    ], channelIcon: "desktop", generalStatus: "Backtracking stop", deliveryService: "Impress Client Portal", deliveryStatus: "Ready in inbox", communicationCreated: "Nov 17, 2024 3:00 PM",
    relatedInvoices: [{ id: "inv-i12", invoiceNumber: "118234765", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Nov 18, 2024" }],
  },
  {
    id: "comm-30", communicationId: "185854454", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Nov 14, 2024 10:00 AM",
    relatedInvoices: [{ id: "inv-i13", invoiceNumber: "119567834", tags: [], transactionType: "Debit", status: "Closed", issueDate: "Nov 15, 2024" }],
  },
  {
    id: "comm-31", communicationId: "185854455", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Oct 21, 2024 3:15 PM",
    relatedInvoices: [{ id: "inv-i14", invoiceNumber: "120345678", tags: [], transactionType: "Credit", status: "Paid", issueDate: "Oct 22, 2024" }],
  },
  {
    id: "comm-32", communicationId: "185854456", tags: [], remarks: [
      { id: "r32-1", author: "Author name", authorType: "user", date: "Sep 4, 2024 2:00 PM", message: "Invoice sent to client via e-invoicing portal." },
    ], channelIcon: "variable", generalStatus: "Distributed", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Sent", communicationCreated: "Sep 4, 2024 2:00 PM",
    relatedInvoices: [{ id: "inv-i15a", invoiceNumber: "121876543", tags: [], transactionType: "Debit", status: "Issued", issueDate: "Sep 05, 2024" }],
  },
  {
    id: "comm-33", communicationId: "185854457", tags: [], remarks: [], channelIcon: "archive", generalStatus: "Finished", deliveryService: "Impress Archive", deliveryStatus: "Archived", communicationCreated: "Sep 4, 2024 2:00 PM",
    relatedInvoices: [{ id: "inv-i15b", invoiceNumber: "121876543", tags: [], transactionType: "Debit", status: "Issued", issueDate: "Sep 05, 2024" }],
  },
  {
    id: "comm-34", communicationId: "185854458", tags: [NEEDS_ATTENTION_TAG], remarks: [
      { id: "r34-1", author: "System", authorType: "system", date: "Aug 24, 2024 5:00 PM", message: "Processing failed: reference number missing.", isError: true },
    ], channelIcon: "variable", generalStatus: "Processing failed", deliveryService: "ChorusPro B2G Supplier", deliveryStatus: "Incident (E)", communicationCreated: "Aug 24, 2024 5:00 PM",
    relatedInvoices: [{ id: "inv-i16", invoiceNumber: "122543987", tags: [], transactionType: "Debit", status: "Disputed", issueDate: "Aug 25, 2024" }],
  },
  {
    id: "comm-35", communicationId: "185854459", tags: [], remarks: [], channelIcon: "variable", generalStatus: "Finished", deliveryService: "FR E-Invoicing PDP Simulator", deliveryStatus: "Payment received", communicationCreated: "Aug 17, 2024 9:45 AM",
    relatedInvoices: [{ id: "inv-i17", invoiceNumber: "123456789", tags: [], transactionType: "Credit", status: "Paid", issueDate: "Aug 18, 2024" }],
  },
];

/* ─── Shared small components ─── */

function ToolbarIcon({ src, inset }: { src: string; inset: string }) {
  return (
    <div className="relative shrink-0 size-5 overflow-hidden">
      <div className="absolute" style={{ inset }}>
        <Img src={src} alt="" className="absolute inset-0 size-full" />
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
  if (count === 0) return <div className="flex items-start gap-1 px-3 py-2" style={{ width: 120 }} />;
  return (
    <div className="flex items-start gap-1 px-3 py-2 cursor-pointer hover:opacity-70" onClick={onClick}>
      <div className="relative shrink-0 size-5 overflow-hidden">
        <Img src="/icons/comment-icon.svg" alt="" className="absolute inset-0 size-full" style={{ opacity: 0.6 }} />
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
        <Img src={channelIconMap[icon]} alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
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
      <Img src="/icons/chevron-right.svg" alt="" className="absolute inset-0 size-full" />
    </div>
  );
}

/* ─── TitleBar ─── */

function TitleBar({ filterIds, onClearFilter }: { filterIds: string[]; onClearFilter: () => void }) {
  const hasFilter = filterIds.length > 0;
  const filterLabel = filterIds.length <= 3 ? filterIds.join(", ") : `${filterIds.slice(0, 3).join(", ")} +${filterIds.length - 3}`;

  return (
    <div
      className="flex flex-col items-start justify-center pb-3"
      style={{ borderBottom: "1px solid #e9e9e9" }}
    >
      <div className="flex w-full items-center pb-6 pr-6">
        <div className="flex flex-1 flex-col items-start min-w-0">
          <div className="flex flex-col items-start justify-end px-[26px]" style={{ height: 53 }}>
            <span className="text-[22px] font-normal leading-8 truncate" style={{ color: "#212121" }}>
              Communications
            </span>
          </div>
          <div className="flex flex-col items-start justify-end px-[26px]">
            <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#212121" }}>
              Communications created by the job.
            </span>
          </div>
        </div>
        <div className="shrink-0" style={{ width: 123, height: 36 }} />
      </div>

      <div className="flex flex-col gap-1.5 items-start px-[26px] w-full">
        <div className="flex items-center w-full">
          <div
            className="flex flex-1 items-center gap-2.5 pl-[13px] pr-[9px] py-2 min-h-0 min-w-0"
            style={{ height: hasFilter ? "auto" : 35, minHeight: 35, border: "1px solid #dbdbdb", borderRadius: 2, backgroundColor: "white" }}
          >
            <div className="flex flex-1 items-center gap-2.5 min-w-0 flex-wrap">
              {hasFilter && (
                <div className="flex items-center shrink-0" style={{ borderRight: "1px solid #dbdbdb" }}>
                  <div className="flex items-center overflow-hidden px-2 shrink-0">
                    <span className="text-[14px] font-normal leading-5 whitespace-nowrap" style={{ color: "#454545" }}>{filterIds.length}</span>
                  </div>
                  <div className="flex items-start p-1 shrink-0">
                    <div className="relative shrink-0 size-5 overflow-hidden">
                      <Img src="/icons/arrow-drop-down.svg" alt="" className="absolute inset-0 size-full" />
                    </div>
                  </div>
                </div>
              )}
              <div className="relative shrink-0 size-6 overflow-hidden">
                <Img src="/icons/filter-alt.svg" alt="" className="absolute inset-0 size-full" />
              </div>
              {hasFilter && (
                <div className="flex items-center shrink-0 gap-2.5 overflow-hidden px-2 py-[2px] rounded-[2px]" style={{ backgroundColor: "#ecf5f7", border: "1px solid #168093" }}>
                  <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#3a3a39", maxWidth: 400 }}>
                    Communication ID: <strong>{filterLabel}</strong>
                  </span>
                  <div className="relative shrink-0 size-5 overflow-hidden cursor-pointer hover:opacity-70" onClick={onClearFilter}>
                    <Img src="/icons/close-small.svg" alt="" className="absolute inset-0 size-full" />
                  </div>
                </div>
              )}
              <span className="text-[13px] font-normal leading-6 truncate" style={{ color: "#747474" }}>
                Type to search
              </span>
            </div>
            <div className="relative shrink-0 size-5 overflow-hidden">
              <Img src="/icons/search.svg" alt="" className="absolute inset-0 size-full" />
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
            Has tag: <strong>Need attention</strong>
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
  const tabs: { label: TabLabel; statuses: GeneralStatus[] | null }[] = [
    { label: "All", statuses: null },
    { label: "Preprocessing", statuses: ["Distributed"] },
    { label: "Transmitted", statuses: ["Delivery failed", "Processing failed"] },
    { label: "Processing", statuses: ["Backtracking stop"] },
    { label: "Finished", statuses: ["Finished"] },
  ];

  return (
    <div className="flex items-end gap-1.5 pr-6" style={{ borderLeft: "1px solid #cfcfcf" }}>
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab;
        const count = tab.statuses === null
          ? Object.values(statusCounts).reduce((sum, c) => sum + c, 0)
          : tab.statuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);
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
  first,
  disabled,
}: {
  icon: string;
  inset: string;
  label: string;
  onClick?: () => void;
  hasDropdown?: boolean;
  first?: boolean;
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
  allExpanded,
  onToggleExpandAll,
  onAddRemark,
  onOpenInfo,
  sidebarOpen,
  allTags,
  selectedRowTags,
  onToggleTag,
  onCreateTag,
}: {
  selectedCount: number;
  onClearSelection: () => void;
  allExpanded: boolean;
  onToggleExpandAll: () => void;
  onAddRemark: () => void;
  onOpenInfo: () => void;
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
          <ToolbarButton
            icon="/icons/sort.svg"
            inset="0"
            label={allExpanded ? "Collapse all" : "Expand all"}
            first
            onClick={onToggleExpandAll}
          />
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
          <ToolbarButton icon="/icons/clone.svg" inset="0" label="Download" hasDropdown disabled />
          <ToolbarButton icon="/icons/clone.svg" inset="0" label="Re-create Job" hasDropdown disabled />
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
    { label: "Communication ID", width: 180, align: "left" as const, padLeft: 20 },
    { label: "Tags", width: 180, align: "left" as const },
    { label: "Remarks", width: 120, align: "left" as const },
    { label: "Channel", width: 147, align: "left" as const },
    { label: "General Status", width: 147, align: "left" as const },
    { label: "Delivery Service", width: 240, align: "left" as const },
    { label: "Delivery Status", width: 147, align: "left" as const },
    { label: "Communication Created", width: undefined, align: "right" as const, flex: true },
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
          <div className="flex items-center w-full" style={{ paddingLeft: col.padLeft ?? 12 }}>
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

/* ─── Expanded Section: Inner Tabs ─── */

function InnerTabButton({ label, active, count, onClick }: { label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-end shrink-0 outline-none"
      style={{ height: 36, borderRadius: 2 }}
    >
      <div
        className="flex h-full items-center justify-center gap-2 px-4 py-[4px] shrink-0 transition-colors duration-150"
        style={
          active
            ? { backgroundColor: "white", borderTop: "1px solid #d4d4d4", borderRight: "1px solid #d4d4d4", borderLeft: "1px solid #d4d4d4", borderBottom: "1px solid white" }
            : { backgroundColor: "#f0f0f0", border: "1px solid #d4d4d4" }
        }
      >
        <span
          className="text-[12px] font-semibold leading-normal text-center whitespace-nowrap"
          style={{ color: active ? "#2e95be" : "#40484b" }}
        >
          {label}
        </span>
        {count !== undefined && (
          <span
            className="text-[12px] font-semibold leading-normal text-center whitespace-nowrap"
            style={{ color: active ? "#2e95be" : "#40484b" }}
          >
            ({count})
          </span>
        )}
      </div>
    </button>
  );
}

function RelatedInvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const columns = [
    { label: "Invoice Number", width: 180, align: "left" as const },
    { label: "Tags", width: 120, align: "left" as const },
    { label: "Transaction Type", width: 147, align: "left" as const },
    { label: "Status", width: 120, align: "left" as const },
    { label: "Issue Date", width: undefined, align: "right" as const, flex: true },
  ];

  return (
    <div className="flex flex-col w-full" style={{ border: "1px solid #dedede" }}>
      <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
        {columns.map((col) => (
          <div
            key={col.label}
            className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`}
            style={{ width: col.flex ? undefined : col.width }}
          >
            <div className="flex items-center w-full pl-3">
              <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
                <span
                  className="text-[12px] font-normal leading-5 truncate block"
                  style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}
                >
                  {col.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {invoices.map((inv) => (
        <div key={inv.id} className="flex items-start w-full" style={{ borderBottom: "1px solid #dedede", backgroundColor: "white" }}>
          <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 180 }}>
            <div className="flex items-center pl-3">
              <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>
                {inv.invoiceNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center self-stretch shrink-0 px-3 py-[6px]" style={{ width: 120, gap: 4 }}>
            {inv.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 147 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                {inv.transactionType}
              </span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 120 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                {inv.status}
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
            <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: inv.tags.some(t => t.id === "overdue") ? "#d42513" : "#212121" }}>
                {inv.issueDate}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunicationRemarksTable({ remarks, communicationId, generalStatus }: { remarks: Remark[]; communicationId: string; generalStatus: GeneralStatus }) {
  const isFailedStatus = generalStatus === "Delivery failed" || generalStatus === "Processing failed";

  const columns = [
    { label: "Communication ID", width: 147, align: "left" as const },
    { label: "Severity", width: 100, align: "left" as const },
    { label: "Code", width: 147, align: "left" as const },
    { label: "Remark Message", width: undefined, align: "left" as const, flex: true },
    { label: "Date", width: 180, align: "right" as const },
  ];

  return (
    <div className="flex flex-col w-full" style={{ border: "1px solid #dedede" }}>
      <div className="flex items-start w-full" style={{ borderBottom: "1px solid rgba(0,0,0,0.12)", backgroundColor: "white" }}>
        {columns.map((col) => (
          <div
            key={col.label}
            className={`flex flex-col items-start justify-center shrink-0 ${col.flex ? "flex-1 min-w-0" : ""}`}
            style={{ width: col.flex ? undefined : col.width }}
          >
            <div className="flex items-center w-full pl-3">
              <div className="flex-1 min-w-0 overflow-hidden px-3 py-2">
                <span
                  className="text-[12px] font-normal leading-5 truncate block"
                  style={{ color: "#adadad", fontFamily: "var(--font-rubik), sans-serif", textAlign: col.align }}
                >
                  {col.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {remarks.map((remark) => {
        const showAsError = remark.isError || isFailedStatus;
        return (
        <div key={remark.id} className="flex items-start w-full" style={{ borderBottom: "1px solid #dedede", backgroundColor: "white" }}>
          <div className="flex items-start self-stretch shrink-0 px-3 py-2" style={{ width: 147 }}>
            <div className="flex items-center pl-3">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                {communicationId}
              </span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 100 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: showAsError ? "#d42513" : "#3a3a39" }}>
                {showAsError ? "Error" : ""}
              </span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 147 }}>
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
                {showAsError ? "120: Auto-rejected" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
            <div className="flex gap-1 items-start px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 whitespace-pre-wrap break-words" style={{ color: showAsError ? "#d42513" : "#212121" }}>
                {remark.message}
              </span>
            </div>
          </div>
          <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 180 }}>
            <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
              <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>
                {remark.date}
              </span>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}

function ExpandedSection({ row, innerTab, onInnerTabChange }: { row: CommunicationRowData; innerTab: string; onInnerTabChange: (tab: string) => void }) {
  return (
    <div className="flex flex-col w-full" style={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #dedede", borderBottom: "1px solid #dedede", paddingLeft: 32 }}>
      <div className="flex items-end gap-1.5 pt-2" style={{ padding: "8px 24px 0 24px" }}>
        <InnerTabButton
          label="Related Invoices"
          active={innerTab === "invoices"}
          onClick={() => onInnerTabChange("invoices")}
        />
        <InnerTabButton
          label="Communication Remarks"
          active={innerTab === "remarks"}
          count={row.remarks.length}
          onClick={() => onInnerTabChange("remarks")}
        />
      </div>
      <div style={{ padding: "0 24px 24px 24px" }}>
        {innerTab === "invoices" ? (
          <RelatedInvoicesTable invoices={row.relatedInvoices} />
        ) : (
          <CommunicationRemarksTable remarks={row.remarks} communicationId={row.communicationId} generalStatus={row.generalStatus} />
        )}
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
  innerTab,
  onToggleSelect,
  onToggleExpand,
  onHover,
  onLeave,
  onRemarkClick,
  onInnerTabChange,
}: {
  row: CommunicationRowData;
  selected: boolean;
  expanded: boolean;
  hovered: boolean;
  innerTab: string;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onHover: () => void;
  onLeave: () => void;
  onRemarkClick: () => void;
  onInnerTabChange: (tab: string) => void;
}) {
  let bg = "white";
  if (selected) bg = "#eeeeee";
  else if (hovered) bg = "#f8f8f8";

  const hasRemarks = row.remarks.length > 0;

  const isFailedStatus = row.generalStatus === "Delivery failed" || row.generalStatus === "Processing failed";

  return (
    <>
      <div
        className="flex items-start w-full transition-colors duration-100"
        style={{ backgroundColor: bg, borderBottom: expanded ? undefined : "1px solid #dedede" }}
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

        <div className="flex items-start gap-2 self-stretch shrink-0 px-3 py-2" style={{ width: 180 }}>
          {hasRemarks ? (
            <TreeSwitcher expanded={expanded} onToggle={onToggleExpand} />
          ) : (
            <div className="shrink-0 size-5" />
          )}
          <span className="text-[14px] font-bold leading-5 truncate cursor-pointer hover:underline" style={{ color: "#2e95be" }}>
            {row.communicationId}
          </span>
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

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 147 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full">
            <span className="text-[14px] font-normal leading-5 truncate" style={{ color: isFailedStatus ? "#d42513" : "#3a3a39" }}>
              {row.generalStatus}
            </span>
          </div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 240 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full">
            <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
              {row.deliveryService}
            </span>
          </div>
        </div>

        <div className="flex items-start self-stretch shrink-0 overflow-hidden" style={{ width: 147 }}>
          <div className="flex gap-1 items-start px-3 py-2 w-full">
            <span className="text-[14px] font-normal leading-5 truncate" style={{ color: "#3a3a39" }}>
              {row.deliveryStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-start self-stretch min-w-0 overflow-hidden">
          <div className="flex gap-1 items-start justify-end px-3 py-2 w-full">
            <span className="text-[14px] font-normal leading-5 truncate text-right" style={{ color: "#212121" }}>
              {row.communicationCreated}
            </span>
          </div>
        </div>
      </div>

      {expanded && hasRemarks && (
        <ExpandedSection row={row} innerTab={innerTab} onInnerTabChange={onInnerTabChange} />
      )}
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
                <Img src="/icons/arrow-drop-down.svg" alt="" className="absolute inset-0 size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-0.5 shrink-0" style={{ height: 36 }}>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><Img src="/icons/first-page.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><Img src="/icons/chevron-left.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        {pages.map((page, idx) => (
          <div key={page} className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100" style={{ height: 36, minWidth: 36, borderLeft: "1px solid #d4d4d4", borderRight: idx === pages.length - 1 ? "1px solid #d4d4d4" : undefined }}>
            <div className="flex items-center justify-center p-2" style={{ minHeight: 36, maxHeight: 36 }}>
              <span className={`text-[14px] leading-5 whitespace-nowrap px-1 ${page === activePage ? "font-bold" : "font-normal"}`} style={{ color: "#212121" }}>{page}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><Img src="/icons/chevron-right.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
        <div className="flex items-center justify-center shrink-0 cursor-pointer hover:bg-black/5 transition-colors duration-100 overflow-hidden rounded-lg p-2" style={{ minHeight: 36, maxHeight: 36 }}>
          <div className="relative shrink-0 size-5 overflow-hidden"><Img src="/icons/last-page.svg" alt="" className="absolute inset-0 size-full" /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function CommunicationsPageWrapper() {
  return (
    <Suspense>
      <CommunicationsPage />
    </Suspense>
  );
}

function CommunicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filterIds, setFilterIds] = useState<string[]>(() => {
    const idsParam = searchParams.get("ids");
    return idsParam ? idsParam.split(",").filter(Boolean) : [];
  });

  const [rows, setRows] = useState<CommunicationRowData[]>(initialRows);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["comm-1"]));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [innerTabs, setInnerTabs] = useState<Record<string, string>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"information" | "remarks">("remarks");
  const [sidebarRowId, setSidebarRowId] = useState<string | null>(null);

  const [allTags, setAllTags] = useState<Tag[]>(initialTags);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    setFilterIds(idsParam ? idsParam.split(",").filter(Boolean) : []);
  }, [searchParams]);

  function handleClearFilter() {
    setFilterIds([]);
    router.replace("/production/communications", { scroll: false });
  }

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

  const idFilteredRows = useMemo(() => {
    if (filterIds.length === 0) return rows;
    const idSet = new Set(filterIds);
    return rows.filter((r) => idSet.has(r.communicationId));
  }, [rows, filterIds]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of idFilteredRows) counts[row.generalStatus] = (counts[row.generalStatus] ?? 0) + 1;
    return counts;
  }, [idFilteredRows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (filterIds.length > 0) {
      const idSet = new Set(filterIds);
      result = result.filter((r) => idSet.has(r.communicationId));
    }
    const statuses = TAB_TO_STATUS[activeTab];
    if (statuses) {
      result = result.filter((r) => statuses.includes(r.generalStatus));
    }
    return result;
  }, [activeTab, rows, filterIds]);

  const expandableIds = useMemo(
    () => new Set(filteredRows.filter((r) => r.remarks.length > 0).map((r) => r.id)),
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

  function setInnerTab(rowId: string, tab: string) {
    setInnerTabs((prev) => ({ ...prev, [rowId]: tab }));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function getFirstSelectedRow(): CommunicationRowData | null {
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
          <TitleBar filterIds={filterIds} onClearFilter={handleClearFilter} />

          <div className="flex flex-1 flex-col min-h-0 overflow-auto" style={{ backgroundColor: "#f5f5f5" }}>
            <div className="flex flex-col px-[26px] pt-[26px] pb-[26px] flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} statusCounts={statusCounts} />
                <ActionToolbar
                  selectedCount={selectedIds.size}
                  onClearSelection={clearSelection}
                  allExpanded={allExpanded}
                  onToggleExpandAll={toggleExpandAll}
                  onAddRemark={handleAddRemark}
                  onOpenInfo={handleOpenInfo}
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
                              expanded={expandedIds.has(row.id)}
                              hovered={hoveredId === row.id}
                              innerTab={innerTabs[row.id] ?? "invoices"}
                              onToggleSelect={() => toggleRow(row.id)}
                              onToggleExpand={() => toggleExpand(row.id)}
                              onHover={() => setHoveredId(row.id)}
                              onLeave={() => setHoveredId(null)}
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
                    open={sidebarOpen}
                    activeTab={sidebarTab}
                    onTabChange={setSidebarTab}
                    onClose={handleCloseSidebar}
                    typeName="Communication"
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
