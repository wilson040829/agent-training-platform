const cards = [
  { title: "Agent 总数", value: "12", sub: "本周新增 3" },
  { title: "已发布版本", value: "8", sub: "草稿 4" },
  { title: "今日调试会话", value: "46", sub: "成功率 91%" },
  { title: "知识库文档", value: "128", sub: "待索引 6" },
];

export default function ConsoleHomePage() {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md shadow-blue-100/50 backdrop-blur-xl">
            <p className="text-xs text-slate-500">{card.title}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md shadow-blue-100/50 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-800">最近操作</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• 电商客服助手 v1.2 发布成功</li>
            <li>• 新增知识库《售后政策》并完成切片</li>
            <li>• 调试会话中修复“退货超时”误答问题</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-md shadow-blue-100/50 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-800">待办事项</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• 补全知识库上传接口</li>
            <li>• 接入发布审批流程</li>
            <li>• 增加多环境回滚策略</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
