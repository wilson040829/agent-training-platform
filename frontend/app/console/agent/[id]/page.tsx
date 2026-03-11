import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

type AgentDetail = {
  id: string;
  name: string;
  description: string;
  persona: string;
  model: string;
  temperature: number;
  tools: string[];
  systemPrompt: string;
  updatedAt?: string;
};

async function getAgent(id: string): Promise<AgentDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AgentSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Agent 分享页</h2>
        <p className="mt-1 text-xs text-slate-500">当前 Agent ID：{id}</p>
      </section>

      {!agent ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          未找到该 Agent，可能已删除或后端未启动。
        </section>
      ) : (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <div>
            <p className="text-xs text-slate-500">名称</p>
            <p className="font-medium">{agent.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">描述</p>
            <p>{agent.description || "-"}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">人格</p>
              <p>{agent.persona}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">模型</p>
              <p>{agent.model}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">温度</p>
              <p>{agent.temperature}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">技能</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(agent.tools || []).map((t) => (
                <span key={t} className="rounded-full bg-[#edf3ff] px-2 py-0.5 text-xs text-[#1d4fd7]">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">System Prompt</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{agent.systemPrompt || "-"}</pre>
          </div>
          <p className="text-xs text-slate-400">最后更新：{agent.updatedAt ? String(agent.updatedAt).replace("T", " ").slice(0, 19) : "-"}</p>

          <div className="pt-2">
            <Link href={`/console/agent/new?agentId=${id}`} className="rounded-lg border border-[#3370ff]/30 px-3 py-2 text-xs text-[#1d4fd7] hover:bg-[#edf3ff]">
              重新配置这个 Agent
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
