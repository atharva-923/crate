import { formatCurrency } from "@/lib/utils";

export default function OrderSummary({ totals, itemCount, children }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <h3 className="stencil text-base font-semibold text-ink">Order Summary</h3>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Subtotal ({itemCount} items)</dt>
          <dd className="font-mono text-ink">{formatCurrency(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-muted">Discount</dt>
            <dd className="font-mono text-pine-600">−{formatCurrency(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-muted">Delivery</dt>
          <dd className="font-mono text-ink">
            {totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Estimated tax</dt>
          <dd className="font-mono text-ink">{formatCurrency(totals.tax)}</dd>
        </div>
      </dl>
      <div className="slat-divider my-4" />
      <div className="flex justify-between text-base font-semibold text-ink">
        <span>Total</span>
        <span className="font-mono">{formatCurrency(totals.total)}</span>
      </div>
      {children}
    </div>
  );
}
