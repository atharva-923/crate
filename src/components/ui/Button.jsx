import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-ivory hover:bg-ink-soft",
  accent: "bg-brass text-ink hover:bg-brass-300",
  outline: "border border-ink text-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-rust text-white hover:opacity-90",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

export default function Button({
  as = "button",
  href,
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
    variants[variant],
    sizes[size],
    className
  );

  if (as === "link" && href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
