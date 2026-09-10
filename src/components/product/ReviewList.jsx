import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return (
      <EmptyState
        title="No reviews yet"
        description="Be the first to share what you thought about this product."
      />
    );
  }

  return (
    <ul className="space-y-6">
      {reviews.map((r) => (
        <li key={r.review_id} className="border-b border-line pb-6 last:border-0">
          <div className="flex items-center justify-between">
            <StarRating rating={r.rating} size="md" />
            {r.verified_purchase && <Badge tone="pine">Verified purchase</Badge>}
          </div>
          <h4 className="mt-2 text-sm font-semibold text-ink">{r.title}</h4>
          <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>
          <p className="mt-2 text-xs text-ink-muted">
            {r.customer_name} &middot; {formatDate(r.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
