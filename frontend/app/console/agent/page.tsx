"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AgentItem = {
  id: string;
  name: string;
  persona: string;
  model: string;
  status?: "DRAFT" | "PUBLISHED";
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function AgentManagePage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "name">("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortBy,
        sortDir,
      });
      const res = await fetch(`${API_BASE}/api/v1/agents?${query.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.items || [];
      setTotal(Number(data?.total || list.length || 0));
      setTotalPages(Number(data?.totalPages || 1));
      setAgents(
        list.map((a: any) => ({
          id: a.id,
          name: a.name,
          persona: a.persona,
          model: a.model,
          status: a.status || "DRAFT",
          updatedAt: a.updatedAt ? String(a.updatedAt).replace("T", " ").slice(0, 19) : "-",
        }))
      );
    } catch (e: any) {
      setError(`加载失败：${e?.message || "unknown"}`);
      setAgents([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [page, size, sortBy, sortDir]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return agents;
    return agents.filter((a) => [a.name, a.persona, a.model, a.id].some((v) => v.toLowerCase().includes(kw)));
  }, [agents, q]);

  const removeAgent = async (id: string) => {
    const ok = window.confirm("确认删除这个 Agent？");
    if (!ok) return;
    const backup = agents;
    setAgents((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch(`${API_BASE}/api/v1/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      setAgents(backup);
      alert(`删除失败：${e?.message || "unknown"}`);
    }
  };

  const switchStatus = async (id: string, status: "DRAFT" | "PUBLISHED") => {
    const nextStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`${API_BASE}/api/v1/agents/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadAgents();
    } catch (e: any) {
      alert(`状态切换失败：${e?.message || "unknown"}`);
    }
  };

  const shareAgent = async (id: string) => {
    const shareUrl = `${window.location.origin}/console/agent/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(`分享链接已复制：${shareUrl}`);
    } catch {
      alert(`分享链接：${shareUrl}`);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md shadow-blue-100/50 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Agent 管理控制台</h2>
            <p className="mt-1 text-xs text-slate-500">添加 Agent / 删除 / 分享 / 重新配置</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAgents} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">刷新</button>
            <Link href="/console/agent/new" className="rounded-lg bg-[#3370ff] px-3 py-2 text-sm font-medium text-white shadow-md shadow-blue-200 hover:bg-[#2966fa]">
              + 添加 Agent
            </Link>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索 Agent 名称/模型/ID"
            className="md:col-span-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#3370ff]"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="updatedAt">按更新时间</option>
            <option value="createdAt">按创建时间</option>
            <option value="name">按名称</option>
          </select>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md shadow-blue-100/50 backdrop-blur-xl">
        {loading ? (
          <p className="text-sm text-slate-500">正在加载 Agent 列表...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2">Agent</th>
                  <th className="pb-2">人格</th>
                  <th className="pb-2">模型</th>
                  <th className="pb-2">状态</th>
                  <th className="pb-2">更新时间</th>
                  <th className="pb-2">操作</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.id}</p>
                    </td>
                    <td className="py-3">{a.persona}</td>
                    <td className="py-3">{a.model}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {a.status === "PUBLISHED" ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="py-3">{a.updatedAt || "-"}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => shareAgent(a.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">分享</button>
                        <button onClick={() => switchStatus(a.id, a.status || "DRAFT")} className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">{a.status === "PUBLISHED" ? "转草稿" : "发布"}</button>
                        <Link href={`/console/agent/new?agentId=${a.id}`} className="rounded-md border border-[#3370ff]/30 px-2 py-1 text-xs text-[#1d4fd7] hover:bg-[#edf3ff]">重新配置</Link>
                        <button onClick={() => removeAgent(a.id)} className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div>共 {total} 条，当前第 {page + 1} / {Math.max(totalPages, 1)} 页</div>
          <div className="flex items-center gap-2">
            <select value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
              <option value={10}>10 / 页</option>
              <option value={20}>20 / 页</option>
              <option value={50}>50 / 页</option>
            </select>
            <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(p - 1, 0))} className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-50">上一页</button>
            <button disabled={page + 1 >= Math.max(totalPages, 1)} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-50">下一页</button>
          </div>
        </div>
      </section>
    </div>
  );
}
