import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function PresetsPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 flex-col p-16 min-h-0 min-w-0" style={{ backgroundColor: "#f5f5f5" }}>
          <div
            className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-2.5 opacity-40"
            style={{ border: "4px dashed #2e95be" }}
          >
            <span className="text-[48px] font-bold text-center whitespace-nowrap" style={{ color: "#2e95be" }}>
              PRESETS PLACEHOLDER
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
