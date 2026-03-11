"use client";

import { useEffect, useMemo, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string; time: string };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function DebugPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState("-");

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/debug/history`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const sorted = [...data].reverse();
      setMessages(
        sorted.map((it: any) => ({
          role: it.role === "assistant" ? "assistant" : "user",
          text: it.content || "",
          time: String(it.createdAt || "").replace("T", " ").slice(11, 19),
        }))
      );
      if (data[0]?.trace) setTrace(data[0].trace);
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { role: "user", text, time }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/debug/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTrace(data.trace || "-");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || "(empty)",
          time: `${new Date().toLocaleTimeString()} · ${data.elapsedMs || 0}ms`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `模拟回复：已收到你的问题「${text}」，建议先检查 Agent Prompt + Knowledge 命中片段。`,
          time: `${new Date().toLocaleTimeString()} · fallback`,
        },
      ]);
      setTrace("fallback(local)");
    } finally {
      setLoading(false);
    }
  };

  const tokenUsage = useMemo(() => {
    const inputChars = messages.filter((m) => m.role === "user").reduce((s, m) => s + m.text.length, 0);
    const outputChars = messages.filter((m) => m.role === "assistant").reduce((s, m) => s + m.text.length, 0);
    return {
      input: Math.ceil(inputChars / 3),
      output: Math.ceil(outputChars / 3),
      cost: ((inputChars + outputChars) / 10000 * 0.02).toFixed(4),
    };
  }, [messages]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">对话与调试</h2>
        <p className="mt-1 text-xs text-slate-500">已接后端接口：/api/v1/debug/chat + /api/v1/debug/history（可追溯历史）。</p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold">Playground</p>
          <div className="mt-3 h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-sm">
            {messages.length === 0 ? <p className="text-slate-400">还没有消息，输入问题开始调试。</p> : null}
            <div className="space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 ${m.role === "user" ? "bg-[#edf3ff] text-[#1d4fd7]" : "bg-white text-slate-700"}`}>
                  <p>{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
                </div>
              ))}
              {loading ? <p className="text-xs text-slate-400">模型思考中...</p> : null}
            </div>
          </div>
          <div className="mt-3 flex gap-2 rounded-lg border border-slate-200 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入调试问题，比如：退货政策是什么？" className="flex-1 px-2 text-sm outline-none" />
            <button onClick={send} className="rounded bg-[#3370ff] px-3 py-1.5 text-sm text-white">发送</button>
          </div>
        </article>

        <article className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">工具调用日志</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li>• Trace: {trace}</li>
              <li>• Retriever: topK=4</li>
              <li>• Reranker: enabled</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">Token 用量</p>
            <p className="mt-2 text-xs text-slate-500">Input: {tokenUsage.input}</p>
            <p className="text-xs text-slate-500">Output: {tokenUsage.output}</p>
            <p className="text-xs text-slate-500">Cost(估算): ${tokenUsage.cost}</p>
          </div>
        </article>
      </section>
    </div>
  );
}
