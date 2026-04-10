"use client";

export default function FlagTag({
  label,
  bgColor,
  textColor,
  borderColor,
  maxWidth,
}: {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  maxWidth?: number;
}) {
  return (
    <div className="flex items-center shrink-0 relative" style={{ marginLeft: 8 }}>
      <svg
        width="8"
        height="22"
        viewBox="0 0 8 22"
        fill="none"
        style={{ position: "absolute", left: -8, top: 0 }}
      >
        <path d="M8 0L0 11L8 22V0Z" fill={bgColor} />
        <path d="M8 0L0 11" stroke={borderColor} strokeWidth="1" />
        <path d="M0 11L8 22" stroke={borderColor} strokeWidth="1" />
      </svg>
      <div
        className="flex items-center px-1 py-[2px]"
        style={{
          backgroundColor: bgColor,
          borderTop: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderRadius: 1,
          maxWidth: maxWidth,
        }}
      >
        <span
          className="text-[13px] font-normal leading-normal whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ color: textColor, fontFamily: "'Open Sans', sans-serif" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
