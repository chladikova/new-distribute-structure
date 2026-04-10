export default function Header() {
  return (
    <header className="flex h-[50px] w-full shrink-0">
      <div className="flex w-[246px] shrink-0 items-center px-4"
        style={{ background: "linear-gradient(to right, #095a66, #0daeb2)" }}>
        <img src="/icons/distribute-logo.svg" alt="Distribute" className="h-[29.5px] w-[124.5px]" />
      </div>

      <div className="flex flex-1 items-center justify-between" style={{ backgroundColor: "#40484b" }}>
        <div className="flex items-center">
          <button className="flex h-[50px] items-center justify-center px-4"
            style={{ backgroundColor: "#098294" }}>
            <span className="text-[13px] font-normal uppercase text-white">
              Control center
            </span>
          </button>
          <div className="flex h-[50px] items-center justify-center px-4"
            style={{ backgroundColor: "#40484b" }}>
            <span className="text-[13px] font-normal uppercase text-white/75">
              Administration
            </span>
          </div>
        </div>

        <div className="flex items-center">
          {/* APPS */}
          <div className="flex h-[50px] items-center justify-center p-1"
            style={{ backgroundColor: "#40484b", borderLeft: "0.5px solid #c9c9c9" }}>
            <div className="flex h-full items-center justify-center gap-1 px-1">
              <IconBox size={24} inset="16.67%">
                <img src="/icons/apps.svg" alt="" className="absolute inset-0 size-full" />
              </IconBox>
              <span className="text-[13px] font-normal uppercase text-white/75 whitespace-nowrap">Apps</span>
            </div>
          </div>

          {/* SETTINGS */}
          <div className="flex h-[50px] items-center justify-center p-1"
            style={{ backgroundColor: "#40484b", borderLeft: "0.5px solid #c9c9c9" }}>
            <div className="flex h-full items-center justify-center gap-1 px-1">
              <IconBox size={24} inset="9.99% 12.5% 10% 12.5%">
                <img src="/icons/settings.svg" alt="" className="absolute inset-0 size-full" style={{ filter: "brightness(0) invert(1)" }} />
              </IconBox>
              <span className="text-[13px] font-normal uppercase text-white/75 whitespace-nowrap">Settings</span>
            </div>
          </div>

          {/* HELP (? icon only) */}
          <div className="flex h-[50px] items-center justify-center p-1"
            style={{ backgroundColor: "#40484b", borderLeft: "0.5px solid #c9c9c9" }}>
            <div className="flex h-full items-center justify-center px-2.5">
              <IconBox size={24} inset="19.95% 31.72% 20% 31.73%">
                <img src="/icons/help.svg" alt="" className="absolute inset-0 size-full" />
              </IconBox>
            </div>
          </div>

          {/* USER */}
          <div className="flex h-[50px] items-center justify-center p-1"
            style={{ backgroundColor: "#40484b", borderLeft: "0.5px solid #c9c9c9" }}>
            <div className="flex h-full items-center justify-center gap-1 px-1">
              <IconBox size={24} inset="10%">
                <img src="/icons/user.svg" alt="" className="absolute inset-0 size-full" />
              </IconBox>
              <span className="text-[13px] font-normal uppercase text-white/75 whitespace-nowrap">Name Surname</span>
              <IconBox size={20} inset="40.43% 35.04%">
                <img src="/icons/arrow-drop-down.svg" alt="" className="absolute inset-0 size-full" />
              </IconBox>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function IconBox({ size, inset, children }: { size: number; inset: string; children: React.ReactNode }) {
  return (
    <div className="relative shrink-0 overflow-hidden opacity-75" style={{ width: size, height: size }}>
      <div className="absolute" style={{ inset }}>
        {children}
      </div>
    </div>
  );
}
