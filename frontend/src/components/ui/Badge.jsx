import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-ink/5 text-ink-soft",
  brass: "bg-brass-50 text-brass-700",
  pine: "bg-pine-50 text-pine-600",
  rust: "bg-rust-50 text-rust",
};

export default function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
