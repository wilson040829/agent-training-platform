"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PERSONAS = ["技术架构师", "客服专家", "销售顾问", "数据分析师"];
const MODELS = ["gpt-4o-mini", "gpt-4.1", "deepseek-chat", "qwen-plus"];
const SKILLS = ["上下文记忆", "实时网页搜索", "知识库检索问答", "会议纪要生成", "代码解释与调试", "飞书消息推送"];
const PROVIDER_OPTIONS = [
  { label: "OpenAI", value: "openai", baseUrl: "https://api.openai.com/v1" },
  { label: "Anthropic", value: "anthropic", baseUrl: "https://api.anthropic.com" },
  { label: "Google Gemini", value: "gemini", baseUrl: "https://generativelanguage.googleapis.com" },
  { label: "DeepSeek", value: "deepseek", baseUrl: "https://api.deepseek.com/v1" },
  { label: "阿里云百炼", value: "dashscope", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { label: "Moonshot", value: "moonshot", baseUrl: "https://api.moonshot.cn/v1" },
  { label: "智谱 GLM", value: "zhipu", baseUrl: "https://open.bigmodel.cn/api/paas/v4" },
  { label: "自定义", value: "custom", baseUrl: "" },
] as const;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

function inferProviderByBaseUrl(baseUrl?: string) {
  if (!baseUrl) return "openai";
  const hit = PROVIDER_OPTIONS.find((p) => p.baseUrl && baseUrl.startsWith(p.baseUrl));
  return hit?.value || "custom";
}

export default function AgentNewPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">页面加载中...</div>}>
      <AgentNewInner />
    </Suspense>
  );
}

function AgentNewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = searchParams.get("agentId");
  const isEdit = Boolean(agentId);

  const [form, setForm] = useState({
    name: "",
    description: "",
    persona: PERSONAS[0],
    model: MODELS[0],
    temperature: 0.7,
    systemPrompt: "",
    tools: [SKILLS[0], SKILLS[2]],
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!agentId) return;
    let ignore = false;
    const run = async () => {
      setInitLoading(true);
      setMsg("");
      try {
        const res = await fetch(`${API_BASE}/api/v1/agents/${agentId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          description: data.description || "",
          persona: data.persona || PERSONAS[0],
          model: data.model || MODELS[0],
          temperature: Number(data.temperature ?? 0.7),
          systemPrompt: data.systemPrompt || "",
          tools: Array.isArray(data.tools) ? data.tools : [],
          provider: inferProviderByBaseUrl(prev.baseUrl),
        }));
      } catch (e: any) {
        if (!ignore) setMsg(`加载 Agent 失败：${e?.message || "unknown"}`);
      } finally {
        if (!ignore) setInitLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [agentId]);

  const toggleSkill = (s: string) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.includes(s) ? prev.tools.filter((x) => x !== s) : [...prev.tools, s],
    }));
  };

  const summary = useMemo(
    () => `${form.persona} · ${form.model} · ${form.tools.length} 技能`,
    [form.persona, form.model, form.tools.length]
  );

  const saveAgent = async () => {
    const name = form.name.trim();
    const systemPrompt = form.systemPrompt.trim();

    if (!name || !systemPrompt) {
      setMsg("请先填写 Agent 名称和 System Prompt");
      return;
    }
    if (name.length < 1 || name.length > 50) {
      setMsg("Agent 名称长度需在 1~50 个字符之间");
      return;
    }
    if (form.temperature < 0 || form.temperature > 2) {
      setMsg("温度参数需在 0~2 之间");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const payload = {
        name,
        description: form.description,
        persona: form.persona,
        systemPrompt,
        model: form.model,
        temperature: form.temperature,
        tools: form.tools,
      };

      const url = isEdit ? `${API_BASE}/api/v1/agents/${agentId}` : `${API_BASE}/api/v1/agents`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const text = await res.text();
          if (text) detail = `，${text.slice(0, 300)}`;
        } catch {}
        throw new Error(`HTTP ${res.status}${detail}`);
      }

      const data = await res.json();
      setMsg(isEdit ? "保存成功：已更新 Agent" : "保存成功：已创建 Agent");
      if (!isEdit && data?.id) {
        router.replace(`/console/agent/new?agentId=${data.id}`);
      }
    } catch (e: any) {
      setMsg(`保存失败：${e?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/agents/connectivity-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          baseUrl: form.baseUrl,
          apiKey: form.apiKey,
          model: form.model,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      setMsg(`${data?.ok ? "连通性正常" : "连通性异常"}：${data?.message || "-"}${data?.endpoint ? `（${data.endpoint}）` : ""}`);
    } catch (e: any) {
      setMsg(`连通性异常：${e?.message || "unknown"}`);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{isEdit ? "重新配置 Agent" : "添加 Agent"}</h2>
            <p className="mt-1 text-xs text-slate-500">{isEdit ? `正在编辑：${agentId}` : "创建一个新的 Agent"}</p>
          </div>
          <Link href="/console/agent" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            返回管理
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          {initLoading ? <p className="text-sm text-slate-500">正在加载 Agent 配置...</p> : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">Agent 名称</p>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">人格</p>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.persona} onChange={(e) => setForm((p) => ({ ...p, persona: e.target.value }))}>
                {PERSONAS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-500">描述</p>
            <textarea className="h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-500">System Prompt</p>
            <textarea className="h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.systemPrompt} onChange={(e) => setForm((p) => ({ ...p, systemPrompt: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-slate-500">模型</p>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}>
                {MODELS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">温度 {form.temperature.toFixed(1)}</p>
              <input type="range" min={0} max={2} step={0.1} value={form.temperature} onChange={(e) => setForm((p) => ({ ...p, temperature: Number(e.target.value) }))} className="w-full accent-[#3370ff]" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-500">技能选择</p>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((s) => (
                <button key={s} type="button" onClick={() => toggleSkill(s)} className={`rounded-lg border px-3 py-2 text-left text-sm ${form.tools.includes(s) ? "border-[#3370ff]/40 bg-[#edf3ff] text-[#1d4fd7]" : "border-slate-200 bg-white text-slate-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#3370ff]/20 bg-[#f8fbff] p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">API 配置（展示区）</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.provider}
                onChange={(e) => {
                  const nextProvider = e.target.value;
                  const hit = PROVIDER_OPTIONS.find((p) => p.value === nextProvider);
                  setForm((p) => ({
                    ...p,
                    provider: nextProvider,
                    baseUrl: hit ? hit.baseUrl : p.baseUrl,
                  }));
                }}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.baseUrl}
                onChange={(e) => setForm((p) => ({ ...p, baseUrl: e.target.value, provider: inferProviderByBaseUrl(e.target.value) }))}
                placeholder="Base URL"
              />
            </div>
            <div className="mt-2">
              <div className="mb-1 flex justify-end">
                <button type="button" onClick={() => setShowKey((v) => !v)} className="text-xs text-[#1d4fd7] hover:underline">{showKey ? "隐藏" : "显示"} API Key</button>
              </div>
              <input type={showKey ? "text" : "password"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.apiKey} onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))} placeholder="sk-..." />
            </div>
          </div>

          {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}

          <div className="flex gap-2">
            <button disabled={loading || initLoading} onClick={saveAgent} className="rounded-lg bg-[#3370ff] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "保存中..." : isEdit ? "保存修改" : "保存 Agent"}
            </button>
            <button onClick={testConnection} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">测试连通性</button>
          </div>
        </article>

        <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700">配置摘要</p>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>{form.name || "未命名 Agent"}</p>
            <p className="mt-1">{summary}</p>
            <p className="mt-1">API: {PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.label || "自定义"}</p>
          </div>
          <p className="text-[11px] text-slate-400">现在这个页面已经接后端创建/更新，不再只是展示页面。</p>
        </aside>
      </section>
    </div>
  );
}
