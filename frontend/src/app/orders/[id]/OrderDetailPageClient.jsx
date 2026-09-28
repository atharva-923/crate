"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchOrderById } from "@/services/api/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatuses } from "@/data/orders";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export default function OrderDetailPageClient() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    fetchOrderById(id).then(setOrder);
  }, [id]);

  if (order === undefined) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState title="Order not found" description="We couldn't find an order with that ID." actionLabel="View my orders" actionHref="/orders" />
      </div>
    );
  }

  const currentIdx = order.timeline.filter((t) => t.done).length - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {searchParams.get("justPlaced") && (
        <div className="mb-6 rounded-lg border border-pine bg-pine-50 p-4 text-sm text-pine-600">
          🎉 Your order has been placed successfully. We'll email you updates as it ships.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Order</p>
          <h1 className="stencil font-mono text-2xl font-semibold text-ink">{order.order_id}</h1>
          <p className="mt-1 text-sm text-ink-muted">Placed on {formatDate(order.placed_at)}</p>
        </div>
        <Badge tone={order.status === "Delivered" ? "pine" : "brass"}>{order.status}</Badge>
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        <h2 className="stencil text-base font-semibold text-ink">Tracking</h2>
        <ol className="mt-6 space-y-6">
          {order.timeline.map((step, idx) => (
            <li key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                    step.done ? "border-pine bg-pine text-white" : "border-line text-ink-muted"
                  }`}
                >
                  {step.done ? "✓" : idx + 1}
                </span>
                {idx < order.timeline.length - 1 && (
                  <span className={`mt-1 h-full w-px flex-1 ${idx < currentIdx ? "bg-pine" : "bg-line"}`} style={{ minHeight: 24 }} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-medium ${step.done ? "text-ink" : "text-ink-muted"}`}>{step.status}</p>
                {step.at && <p className="text-xs text-ink-muted">{formatDate(step.at)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="stencil text-sm font-semibold text-ink">Delivery address</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
            {order.address.city}, {order.address.state} {order.address.postal_code}<br />
            {order.address.country}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="stencil text-sm font-semibold text-ink">Payment</h2>
          <p className="mt-2 text-sm text-ink-soft">{order.payment_method}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 className="stencil text-sm font-semibold text-ink">Items</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.product_id} className="flex justify-between py-2.5 text-sm">
              <Link href={`/products/${i.product_id}`} className="text-ink-soft hover:text-ink hover:underline">
                {i.name} × {i.qty}
              </Link>
              <span className="font-mono text-ink">{formatCurrency(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><span className="text-ink-muted">Subtotal</span><span className="font-mono">{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-ink-muted">Delivery</span><span className="font-mono">{order.delivery_fee === 0 ? "Free" : formatCurrency(order.delivery_fee)}</span></div>
          <div className="flex justify-between"><span className="text-ink-muted">Tax</span><span className="font-mono">{formatCurrency(order.tax)}</span></div>
          <div className="flex justify-between text-base font-semibold text-ink"><span>Total</span><span className="font-mono">{formatCurrency(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
