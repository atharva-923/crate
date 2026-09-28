export default function InfoPage({ eyebrow, title, intro, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">{eyebrow}</p>
      )}
      <h1 className="stencil mt-2 text-3xl font-semibold text-ink">{title}</h1>
      {intro && <p className="mt-4 text-base text-ink-soft">{intro}</p>}
      <div className="slat-divider my-8" />
      <div className="space-y-8 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

export function InfoSection({ title, children }) {
  return (
    <section>
      <h2 className="stencil text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
