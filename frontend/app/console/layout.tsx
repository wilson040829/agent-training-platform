import Link from "next/link";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/console", label: "概览 Dashboard" },
  { href: "/console/agent", label: "Agent 管理" },
  { href: "/console/knowledge", label: "知识库训练" },
  { href: "/console/debug", label: "对话与调试" },
  { href: "/console/release", label: "发布与版本" },
];

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#dbeafe_0%,#bfdbfe_20%,#eef4ff_45%,#f8fbff_100%)] text-slate-800">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/70 bg-white/60 p-4 shadow-lg shadow-blue-100/50 backdrop-blur-sm">
          <div className="mb-5 rounded-2xl border border-white/60 bg-gradient-to-r from-[#3370ff] to-[#5a92ff] px-4 py-3 text-white shadow-lg shadow-blue-200/60">
            <p className="text-xs text-blue-100">Agent Console</p>
            <p className="mt-1 text-base font-semibold">训练与运营控制台</p>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="block rounded-xl border border-transparent bg-white/70 px-3 py-2.5 text-sm text-slate-600 transition hover:border-[#3370ff]/30 hover:bg-[#edf3ff] hover:text-[#1d4fd7]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="p-4 lg:p-6">
          <header className="mb-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-5 py-3 shadow-md shadow-blue-100/50 backdrop-blur-sm">
            <div>
              <p className="text-xs text-slate-500">智能体平台</p>
              <h1 className="text-lg font-semibold text-slate-800">Agent Training Platform</h1>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">系统正常</span>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
