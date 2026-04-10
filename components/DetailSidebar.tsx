"use client";

import { useState } from "react";

export interface Remark {
  id: string;
  author: string;
  authorType: "user" | "system";
  date: string;
  message: string;
  isError?: boolean;
}

export interface ObjectInfo {
  incidentType: string;
  incidentDate: string;
  severity: string;
  incident: string;
  description: string;
  clientId: string;
  deliveryService: string;
}

interface DetailSidebarProps {
  open: boolean;
  activeTab: "information" | "remarks";
  onTabChange: (tab: "information" | "remarks") => void;
  onClose: () => void;
  typeName: string;
  remarks: Remark[];
  info?: ObjectInfo;
  onSubmitRemark: (message: string) => void;
  emptyStateMessage?: string;
}

export default function DetailSidebar({
  open,
  activeTab,
  onTabChange,
  onClose,
  typeName,
  remarks,
  info,
  onSubmitRemark,
  emptyStateMessage,
}: DetailSidebarProps) {
  const [commentText, setCommentText] = useState("");

  if (!open) return null;

  function handleSubmit() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onSubmitRemark(trimmed);
    setCommentText("");
  }

  return (
    <div
      className="flex flex-col shrink-0"
      style={{ width: 398, backgroundColor: "white", borderBottom: "1px solid #cfcfcf" }}
    >
      {/* HEADER */}
      <div
        className="flex flex-col items-center shrink-0"
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #dedede",
          borderLeft: "1px solid #dedede",
        }}
      >
        <div
          className="flex items-center w-full gap-2"
          style={{ height: 64, paddingLeft: 20, paddingRight: 14, paddingTop: 20, paddingBottom: 20 }}
        >
          <div className="flex-1 min-w-0">
            <span
              className="text-[16px] font-semibold leading-6 truncate block"
              style={{ color: "#212121" }}
            >
              {typeName} Details
            </span>
          </div>
          <div
            className="shrink-0 size-6 cursor-pointer hover:opacity-70 relative overflow-hidden"
            onClick={onClose}
          >
            <img src="/icons/close.svg" alt="Close" className="absolute inset-0 size-full" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col items-start px-3 w-full">
          <div
            className="flex items-end gap-1.5 pr-6 w-full"
            style={{ borderLeft: "1px solid #cfcfcf" }}
          >
            <SidebarTab
              label="Information"
              active={activeTab === "information"}
              onClick={() => onTabChange("information")}
            />
            <SidebarTab
              label="Remarks"
              active={activeTab === "remarks"}
              onClick={() => onTabChange("remarks")}
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="flex flex-1 flex-col items-center overflow-hidden"
        style={{
          backgroundColor: "#f5f5f5",
          borderLeft: "1px solid #dedede",
        }}
      >
        {activeTab === "information" ? (
          <InformationContent info={info} />
        ) : emptyStateMessage ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <span className="text-[14px] text-center" style={{ color: "#aeaeae" }}>
              {emptyStateMessage}
            </span>
          </div>
        ) : (
          <RemarksContent
            remarks={remarks}
            commentText={commentText}
            onCommentChange={setCommentText}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

function SidebarTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-end shrink-0 outline-none"
      style={{ height: 40, borderRadius: 2 }}
    >
      <div
        className="flex h-full items-center justify-center gap-3 px-5 py-[5px] shrink-0 transition-colors duration-150 relative"
        style={
          active
            ? {
                backgroundColor: "white",
                borderTop: "1px solid #d4d4d4",
                borderRight: "1px solid #d4d4d4",
                borderLeft: "1px solid #d4d4d4",
                borderBottom: "1px solid white",
              }
            : {
                backgroundColor: "#f0f0f0",
                border: "1px solid #d4d4d4",
              }
        }
      >
        <span
          className="text-[13px] font-semibold leading-normal text-center whitespace-nowrap"
          style={{ color: active ? "#2e95be" : "#40484b" }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

function InformationContent({ info }: { info?: ObjectInfo }) {
  if (!info) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <span className="text-[14px]" style={{ color: "#aeaeae" }}>
          No information available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center overflow-auto w-full py-4 px-4">
      <div
        className="flex flex-col gap-4 items-start p-4 w-full"
        style={{ backgroundColor: "white", border: "1px solid #dedede" }}
      >
        {/* Incident Type */}
        <InfoLabel label={info.incidentType} />

        {/* Collapsible date */}
        <div className="flex items-center w-full">
          <div className="relative shrink-0 size-6 overflow-hidden">
            <img
              src="/icons/arrow-drop-down.svg"
              alt=""
              className="absolute inset-0 size-full"
            />
          </div>
          <span
            className="text-[14px] font-semibold leading-5"
            style={{ color: "#3a3a39" }}
          >
            {info.incidentDate}
          </span>
        </div>

        {/* Error Detail section */}
        <div className="flex flex-col gap-4 items-start pb-4 w-full">
          <InfoField label="Date:" value={info.incidentDate} />
          <InfoField label="Severity" value={info.severity} />
          <InfoField label="Incident" value={info.incident} />

          <div className="flex flex-col items-start pl-6 w-full">
            <div className="flex items-center gap-3">
              <span
                className="text-[14px] font-normal leading-5"
                style={{ color: "#3a3a39" }}
              >
                Description:
              </span>
              <div className="relative shrink-0 size-5 overflow-hidden">
                <img
                  src="/icons/info.svg"
                  alt=""
                  className="absolute inset-0 size-full"
                />
              </div>
            </div>
            <span
              className="text-[14px] font-semibold leading-5"
              style={{ color: "#3a3a39" }}
            >
              {info.description}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full" style={{ height: 1, backgroundColor: "#dedede" }} />

        {/* Recipient Information */}
        <div className="flex flex-col items-start justify-center pt-4 w-full">
          <span
            className="text-[16px] font-semibold leading-5"
            style={{ color: "#3a3a39" }}
          >
            Recipient Information
          </span>
        </div>
        <InfoField label="Client ID:" value={info.clientId} />

        {/* Divider */}
        <div className="w-full" style={{ height: 1, backgroundColor: "#dedede" }} />

        {/* Delivery Options */}
        <div className="flex flex-col items-start justify-center pt-4 w-full">
          <span
            className="text-[16px] font-semibold leading-5"
            style={{ color: "#3a3a39" }}
          >
            Delivery Options
          </span>
        </div>
        <InfoField label="Delivery service:" value={info.deliveryService} />
      </div>
    </div>
  );
}

function InfoLabel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-start justify-center w-full">
      <span className="text-[14px] font-normal leading-5" style={{ color: "#3a3a39" }}>
        {label}
      </span>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start pl-6 w-full">
      <span className="text-[14px] font-normal leading-5" style={{ color: "#3a3a39" }}>
        {label}
      </span>
      <span className="text-[14px] font-semibold leading-5" style={{ color: "#3a3a39" }}>
        {value}
      </span>
    </div>
  );
}

function RemarksContent({
  remarks,
  commentText,
  onCommentChange,
  onSubmit,
}: {
  remarks: Remark[];
  commentText: string;
  onCommentChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center overflow-hidden w-full">
      {/* Textarea area */}
      <div
        className="flex flex-col items-start p-4 w-full shrink-0"
        style={{ borderLeft: "1px solid #dedede" }}
      >
        <div
          className="flex flex-col items-end gap-2 w-full p-5"
          style={{ backgroundColor: "white", border: "1px solid #dedede" }}
        >
          <textarea
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full text-[13px] font-normal leading-[19px] outline-none resize-y"
            style={{
              height: 76,
              minHeight: 40,
              border: "1px solid #d4d4d4",
              borderRadius: 2,
              padding: "7px 12px",
              color: "#40484b",
              fontFamily: "inherit",
            }}
            placeholder="Add a remark..."
          />
          <button
            type="button"
            onClick={onSubmit}
            className="text-[13px] font-semibold cursor-pointer outline-none hover:opacity-70 transition-opacity duration-150"
            style={{
              color: "#40484b",
              background: "none",
              border: "none",
              padding: "2px",
            }}
          >
            SUBMIT
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex flex-1 items-start justify-center overflow-auto w-full px-4 pb-4">
        <div
          className="flex flex-col items-center w-full"
          style={{ backgroundColor: "white", border: "1px solid #dedede" }}
        >
          {remarks.map((remark, idx) => (
            <CommentItem
              key={remark.id}
              remark={remark}
              isLast={idx === remarks.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ remark, isLast }: { remark: Remark; isLast: boolean }) {
  const isSystem = remark.authorType === "system";

  return (
    <div
      className="flex flex-col gap-3 items-end overflow-hidden p-3 w-full"
      style={isLast ? undefined : { borderBottom: "1px solid #dedede" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1 items-start">
          <span
            className="text-[13px] font-bold leading-normal whitespace-nowrap"
            style={{ color: "#2e95be" }}
          >
            {remark.author}
          </span>
          <span
            className="text-[13px] font-normal leading-normal whitespace-nowrap"
            style={{ color: "#aeaeae" }}
          >
            {remark.date}
          </span>
        </div>
        <div className="relative shrink-0 size-6 overflow-hidden cursor-pointer hover:opacity-60">
          <img src="/icons/more-vert.svg" alt="" className="absolute inset-0 size-full" />
        </div>
      </div>

      {/* Message */}
      <p
        className="text-[13px] font-normal leading-[19px] w-full whitespace-pre-wrap break-words"
        style={{
          color: remark.isError ? "#e34243" : "#40484b",
          margin: 0,
        }}
      >
        {remark.message}
      </p>
    </div>
  );
}
