import ProductCard from "./ProductCard";
import EmptyState from "@/components/ui/EmptyState";

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-line bg-surface">
            <div className="aspect-[4/5] bg-ink/5" />
            <div className="space-y-2 p-3.5">
              <div className="h-2.5 w-1/3 rounded bg-ink/5" />
              <div className="h-3.5 w-4/5 rounded bg-ink/5" />
              <div className="h-3.5 w-1/2 rounded bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try a different search term, or clear your filters to see everything we carry."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.product_id} product={p} />
      ))}
    </div>
  );
}
