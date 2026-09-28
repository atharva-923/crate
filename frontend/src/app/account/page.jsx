"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchOrdersByCustomer } from "@/services/api/orderService";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function AccountPage() {
  const { customer, logoutCustomer, ready } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (ready && !customer) router.replace("/login?redirect=/account");
  }, [ready, customer, router]);

  useEffect(() => {
    if (customer) fetchOrdersByCustomer(customer.customer_id).then(setOrders);
  }, [customer]);

  if (!customer) return null;

  const address = customer.addresses?.[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="stencil text-2xl font-semibold text-ink">
            Hi, {customer.first_name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{customer.email}</p>
        </div>
        <Button variant="outline" onClick={() => { logoutCustomer(); router.push("/"); }}>
          Log out
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="stencil text-base font-semibold text-ink">Recent orders</h2>
            <Link href="/orders" className="text-sm font-medium text-brass-700 hover:underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No orders yet" description="Your placed orders will show up here." actionLabel="Start shopping" actionHref="/products" />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.slice(0, 3).map((o) => (
                <li key={o.order_id} className="py-3.5">
                  <Link href={`/orders/${o.order_id}`} className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-medium text-ink">{o.order_id}</p>
                      <p className="text-xs text-ink-muted">{formatDate(o.placed_at)} &middot; {o.items.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-ink">{formatCurrency(o.total)}</p>
                      <Badge tone={o.status === "Delivered" ? "pine" : "brass"}>{o.status}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="stencil text-base font-semibold text-ink">Saved address</h2>
            {address ? (
              <p className="mt-3 text-sm text-ink-soft">
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}, {address.state} {address.postal_code}<br />
                {address.country}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">No saved addresses yet.</p>
            )}
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <h2 className="stencil text-base font-semibold text-ink">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/wishlist" className="text-brass-700 hover:underline">Wishlist</Link></li>
              <li><Link href="/orders" className="text-brass-700 hover:underline">Order history</Link></li>
              <li><Link href="/help-center" className="text-brass-700 hover:underline">Help Center</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
