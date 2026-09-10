export default function StatCard({ label, value, tone = "ink" }) {
  const toneClass = {
    ink: "text-ink",
    pine: "text-pine-600",
    rust: "text-rust",
    brass: "text-brass-700",
  }[tone];

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`stencil mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
