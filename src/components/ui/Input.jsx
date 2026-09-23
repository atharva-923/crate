import { cn } from "@/lib/utils";

export function Field({ label, error, hint, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-rust"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rust">{error}</span>}
    </label>
  );
}

export default function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25",
        error ? "border-rust" : "border-line",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, error, options = [], ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25",
        error ? "border-rust" : "border-line",
        className
      )}
      {...props}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
