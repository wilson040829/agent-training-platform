"use client";

import { useEffect, useMemo, useState } from "react";

type VersionItem = {
  id: string;
  version: string;
  status: "已发布" | "草稿";
  publishedAt: string;
  note: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function ReleasePage() {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [releaseNote, setReleaseNote] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/releases`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg(`加载版本失败：${e?.message || "unknown"}`);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/v1/releases/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: releaseNote }),
    });
    if (res.ok) {
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
      setMsg("发布成功");
    }
  };

  const rollbackTo = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/v1/releases/${id}/rollback`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
      setMsg("回滚成功");
    }
  };

  const published = useMemo(() => versions.find((v) => v.status === "已发布"), [versions]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">发布与版本</h2>
        <p className="mt-1 text-xs text-slate-500">已接后端接口：版本列表/发布/回滚。</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={releaseNote}
            onChange={(e) => setReleaseNote(e.target.value)}
            placeholder="发布说明（可选）"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              const draft = versions.find((v) => v.status === "草稿");
              if (draft) publish(draft.id);
            }}
            className="rounded-lg bg-[#3370ff] px-4 py-2 text-sm font-medium text-white"
          >
            发布当前草稿
          </button>
          <button onClick={load} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">刷新</button>
        </div>

        {msg ? <p className="mb-2 text-xs text-slate-500">{msg}</p> : null}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">版本</th>
              <th className="pb-2">状态</th>
              <th className="pb-2">发布时间</th>
              <th className="pb-2">说明</th>
              <th className="pb-2">操作</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {versions.map((v) => (
              <tr key={v.id} className="border-b border-slate-100">
                <td className="py-2">{v.version}</td>
                <td className={`py-2 ${v.status === "已发布" ? "text-emerald-600" : "text-amber-600"}`}>{v.status}</td>
                <td className="py-2">{v.publishedAt === "-" ? "-" : String(v.publishedAt).replace("T", " ").slice(0, 19)}</td>
                <td className="py-2">{v.note || "-"}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    {v.status === "草稿" ? (
                      <button onClick={() => publish(v.id)} className="rounded border border-[#3370ff]/30 px-2 py-1 text-xs text-[#1d4fd7]">发布</button>
                    ) : null}
                    <button onClick={() => rollbackTo(v.id)} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600">回滚到此版本</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        当前线上版本：<span className="font-semibold text-slate-800">{published?.version || "-"}</span>
      </section>
    </div>
  );
}
