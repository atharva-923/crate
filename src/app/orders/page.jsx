"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchOrdersByCustomer } from "@/services/api/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const { customer, ready } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (ready && !customer) router.replace("/login?redirect=/orders");
  }, [ready, customer, router]);

  useEffect(() => {
    if (customer) fetchOrdersByCustomer(customer.customer_id).then(setOrders);
  }, [customer]);

  if (!customer || orders === null) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="stencil text-2xl font-semibold text-ink">Order History</h1>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders yet" description="Orders you place will appear here." actionLabel="Start shopping" actionHref="/products" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.order_id}>
              <Link href={`/orders/${o.order_id}`} className="block rounded-lg border border-line bg-surface p-5 transition-shadow hover:shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-ink">{o.order_id}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">Placed on {formatDate(o.placed_at)}</p>
                  </div>
                  <Badge tone={o.status === "Delivered" ? "pine" : "brass"}>{o.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <p className="text-sm text-ink-soft">
                    {o.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="font-mono text-sm font-semibold text-ink">{formatCurrency(o.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
