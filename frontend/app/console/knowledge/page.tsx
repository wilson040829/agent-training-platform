"use client";

import { useEffect, useMemo, useState } from "react";

type DocItem = {
  id: string;
  name: string;
  status: "待训练" | "训练中" | "已完成" | "失败";
  sizeKb: number;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function KnowledgePage() {
  const [chunkSize, setChunkSize] = useState(500);
  const [topK, setTopK] = useState(4);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [msg, setMsg] = useState("");

  const loadDocs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/knowledge/docs`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg(`加载知识库失败：${e?.message || "unknown"}`);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const onFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const f of Array.from(files)) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/knowledge/docs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (e: any) {
        setMsg(`上传记录失败：${e?.message || "unknown"}`);
      }
    }
    await loadDocs();
  };

  const startTrain = async (id: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "训练中" } : d)));
    try {
      const res = await fetch(`${API_BASE}/api/v1/knowledge/docs/${id}/train`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadDocs();
    } catch (e: any) {
      setMsg(`训练失败：${e?.message || "unknown"}`);
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "失败" } : d)));
    }
  };

  const stats = useMemo(() => {
    const indexed = docs.filter((d) => d.status === "已完成").length;
    const processing = docs.filter((d) => d.status === "训练中").length;
    const failed = docs.filter((d) => d.status === "失败").length;
    return { indexed, processing, failed };
  }, [docs]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">知识库训练（RAG）</h2>
        <p className="mt-1 text-xs text-slate-500">已接后端接口：文档登记/训练状态。</p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <p className="text-sm font-semibold">上传与参数</p>
          <label className="mt-3 block rounded-lg border border-dashed border-[#3370ff]/35 bg-[#f7faff] p-6 text-center text-sm text-slate-500 hover:bg-[#f0f7ff]">
            点击选择文档（PDF / DOCX / Markdown / TXT）
            <input type="file" multiple className="hidden" onChange={(e) => onFileChange(e.target.files)} />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <label className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs text-slate-500">Chunk Size</p>
              <input type="number" min={100} max={2000} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value || 500))} className="w-full rounded border border-slate-200 px-2 py-1" />
            </label>
            <label className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs text-slate-500">Top K</p>
              <input type="number" min={1} max={20} value={topK} onChange={(e) => setTopK(Number(e.target.value || 4))} className="w-full rounded border border-slate-200 px-2 py-1" />
            </label>
          </div>

          {msg ? <p className="mt-3 text-xs text-rose-600">{msg}</p> : null}

          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2">文档</th>
                  <th className="pb-2">大小</th>
                  <th className="pb-2">状态</th>
                  <th className="pb-2">上传时间</th>
                  <th className="pb-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="py-2">{d.name}</td>
                    <td className="py-2">{d.sizeKb} KB</td>
                    <td className="py-2">{d.status}</td>
                    <td className="py-2">{String(d.createdAt).replace("T", " ").slice(0, 19)}</td>
                    <td className="py-2">
                      <button
                        disabled={d.status === "训练中" || d.status === "已完成"}
                        onClick={() => startTrain(d.id)}
                        className="rounded border border-[#3370ff]/30 px-2 py-1 text-xs text-[#1d4fd7] disabled:opacity-40"
                      >
                        开始训练
                      </button>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-400" colSpan={5}>暂无文档，先上传一个试试</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold">索引状态</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• 已索引：{stats.indexed}</li>
            <li>• 处理中：{stats.processing}</li>
            <li>• 失败：{stats.failed}</li>
            <li>• 参数：chunk={chunkSize} / topK={topK}</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
