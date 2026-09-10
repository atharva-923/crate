import { cn } from "@/lib/utils";

export default function Stepper({ steps, current }) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((step, idx) => {
        const state = idx < current ? "done" : idx === current ? "active" : "upcoming";
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                  state === "done" && "bg-pine border-pine text-white",
                  state === "active" && "bg-ink border-ink text-ivory",
                  state === "upcoming" && "border-line text-ink-muted bg-surface"
                )}
              >
                {state === "done" ? "✓" : idx + 1}
              </div>
              <span
                className={cn(
                  "mt-1.5 whitespace-nowrap text-[11px] font-medium",
                  state === "upcoming" ? "text-ink-muted" : "text-ink"
                )}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  idx < current ? "bg-pine" : "bg-line"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
