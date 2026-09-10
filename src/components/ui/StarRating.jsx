export default function StarRating({ rating = 0, count, size = "sm" }) {
  const dims = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const full = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={dims}
            fill={i <= full ? "#C08829" : "#E4E0D6"}
            aria-hidden="true"
          >
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
          </svg>
        ))}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-ink-muted">({count.toLocaleString("en-IN")})</span>
      )}
    </span>
  );
}
