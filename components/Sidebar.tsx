"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Img from "@/components/Img";

interface ParentItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  href?: string;
  placeholder?: boolean;
  children?: { label: string; href?: string; placeholder?: boolean }[];
}

function SidebarIcon({ src, inset }: { src: string; inset: string }) {
  return (
    <div className="relative size-5 shrink-0 overflow-hidden">
      <div className="absolute" style={{ inset }}>
        <Img src={src} alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}

function ExpandMoreIcon() {
  return (
    <div className="relative size-5 shrink-0 overflow-hidden">
      <div className="absolute" style={{ inset: "36.28% 26.72%" }}>
        <Img src="/icons/expand-more-raw.svg" alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}

function ProductionIcon() {
  return (
    <div className="relative size-5 shrink-0 overflow-hidden">
      <div className="absolute" style={{ inset: "10% 21.89% 10% 10%" }}>
        <Img src="/icons/production-1.svg" alt="" className="absolute inset-0 size-full" />
      </div>
      <div className="absolute" style={{ inset: "35% 10% 35% 55%" }}>
        <Img src="/icons/production-2.svg" alt="" className="absolute inset-0 size-full" />
      </div>
    </div>
  );
}

const menuItems: ParentItem[] = [
  { icon: <SidebarIcon src="/icons/home.svg" inset="9.97% 9.99% 10% 10%" />, label: "Homepage", href: "/", placeholder: true },
  { icon: <SidebarIcon src="/icons/dashboard.svg" inset="12.5%" />, label: "Dashboard", href: "/dashboard", placeholder: true },
  { icon: <SidebarIcon src="/icons/assignment.svg" inset="8.33% 12.5%" />, label: "Needs attention", href: "/needs-attention" },
  { icon: <SidebarIcon src="/icons/construction.svg" inset="12.62% 10.66%" />, label: "Preparation", children: [{ label: "Jobs", href: "/preparation/jobs" }, { label: "Presets", href: "/preparation/presets", placeholder: true }, { label: "Logs", href: "/preparation/logs", placeholder: true }] },
  { icon: <ProductionIcon />, label: "Production", children: [{ label: "Communications", href: "/production/communications" }, { label: "Reports", href: "/production/reports", placeholder: true }] },
  { icon: <SidebarIcon src="/icons/insert-drive-file.svg" inset="8.33% 16.67%" />, label: "Domain", children: [{ label: "Invoices", href: "/domain/invoices" }, { label: "Payments", href: "/domain/payments", placeholder: true }] },
  { icon: <SidebarIcon src="/icons/tags-manager.svg" inset="10%" />, label: "Tags Manager", href: "/tags-manager" },
];

const pathToLabel: Record<string, string> = {
  "/": "Homepage",
  "/dashboard": "Dashboard",
  "/needs-attention": "Needs attention",
  "/preparation/jobs": "Jobs",
  "/preparation/presets": "Presets",
  "/preparation/logs": "Logs",
  "/production/communications": "Communications",
  "/production/reports": "Reports",
  "/domain/invoices": "Invoices",
  "/domain/payments": "Payments",
  "/tags-manager": "Tags Manager",
};

export default function Sidebar({ activePage }: { activePage?: string }) {
  const pathname = usePathname();
  const currentPage = activePage ?? pathToLabel[pathname] ?? "Homepage";

  return (
    <aside className="flex w-[246px] shrink-0 flex-col bg-white" style={{ borderRight: "1px solid #e9e9e9" }}>
      <nav className="flex flex-col">
        {menuItems.map((item, index) => {
          const childActive = item.children?.some((c) => c.label === currentPage) ?? false;
          return (
          <div key={item.label}>
            <ParentMenuItem item={{ ...item, active: item.label === currentPage || childActive }} />

            {item.children && (
              <div className="flex flex-col pb-6">
                {item.children.map((child) => (
                  <SubMenuItem key={child.label} label={child.label} href={child.href} active={child.label === currentPage} placeholder={child.placeholder} />
                ))}
              </div>
            )}

            {index < menuItems.length - 1 && <Separator />}
          </div>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-center overflow-hidden p-[23px]">
        <span className="truncate text-[12px] font-normal" style={{ color: "#aeaeae" }}>
          Quadient, Copyright © 2026
        </span>
      </div>
    </aside>
  );
}

function ParentMenuItem({ item }: { item: ParentItem }) {
  const content = (
    <div
      className="flex h-[60px] items-center gap-5 overflow-hidden px-5 py-[5px] transition-colors duration-150"
      style={{
        minWidth: 160,
        borderLeft: item.active ? "4px solid #098294" : "4px solid transparent",
        backgroundColor: item.active ? "rgba(190, 218, 223, 1)" : undefined,
        cursor: item.href ? "pointer" : "default",
        opacity: item.placeholder ? 0.45 : undefined,
      }}
    >
      <div className="flex flex-1 items-center gap-2.5 min-w-0">
        {item.icon}
        <span className="truncate text-[13px] font-bold" style={{ color: "#40484b" }}>
          {item.label}
        </span>
      </div>
      {item.children && (
        <div className="flex shrink-0 items-center">
          <ExpandMoreIcon />
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block no-underline hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

function SubMenuItem({ label, href, active, placeholder }: { label: string; href?: string; active?: boolean; placeholder?: boolean }) {
  const content = (
    <div
      className="flex h-10 items-center gap-5 overflow-hidden px-5 py-[5px] transition-colors duration-150"
      style={{
        minWidth: 160,
        cursor: href ? "pointer" : "default",
        backgroundColor: active ? "rgba(190, 218, 223, 0.4)" : undefined,
        opacity: placeholder ? 0.45 : undefined,
      }}
    >
      <div className="flex flex-1 items-center gap-2.5 min-w-0">
        <div className="size-5 shrink-0" />
        <span
          className="flex-1 truncate text-[13px] min-w-0"
          style={{ color: active ? "#098294" : "#40484b", fontWeight: active ? 600 : 400 }}
        >
          {label}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

function Separator() {
  return <div className="w-full" style={{ borderBottom: "1px solid #e9e9e9" }} />;
}
