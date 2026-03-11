export default function ConsoleLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 rounded-2xl border border-white/70 bg-white/70" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/70 bg-white/75" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-44 rounded-2xl border border-white/70 bg-white/75" />
        <div className="h-44 rounded-2xl border border-white/70 bg-white/75" />
      </div>
    </div>
  );
}
