"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSellerProducts,
  fetchSellerOrders,
  fetchSellerStats,
  fetchSellerProfile,
  fetchSellerCustomers,
} from "@/services/api/sellerService";
import { fetchReviewsByProduct } from "@/services/api/reviewService";
import { formatCurrency, formatDate } from "@/lib/utils";

const finalPrice = (p) => Math.round(p.price * (1 - (p.discount_percent || 0) / 100));
import DashboardNav from "@/components/seller/DashboardNav";
import StatCard from "@/components/seller/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input, { Field } from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import StarRating from "@/components/ui/StarRating";

export default function SellerDashboardPage() {
  const { seller, logoutSeller, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [storeProfile, setStoreProfile] = useState({});
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (ready && !seller) router.replace("/seller/login");
  }, [ready, seller, router]);

  useEffect(() => {
    if (!seller) return;
    fetchSellerProducts(seller.seller_id).then(setProducts);
    fetchSellerOrders(seller.seller_id).then(setOrders);
    fetchSellerStats(seller.seller_id).then(setStats);
    fetchSellerProfile(seller.seller_id).then(setStoreProfile);
    fetchSellerCustomers(seller.seller_id).then(setCustomers);
  }, [seller]);

  useEffect(() => {
    if (!products.length) return;
    Promise.all(products.map((p) => fetchReviewsByProduct(p.product_id))).then((results) => {
      setReviews(
        results.flatMap((r, idx) =>
          r.reviews.map((rv) => ({ ...rv, productName: products[idx].name }))
        )
      );
    });
  }, [products]);

  if (!seller) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Seller Dashboard</p>
          <h1 className="stencil text-2xl font-semibold text-ink">{seller.store_name}</h1>
        </div>
        <Button variant="outline" onClick={() => { logoutSeller(); router.push("/"); }}>
          Log out
        </Button>
      </div>

      <div className="mt-6">
        <DashboardNav active={tab} onChange={setTab} />
      </div>

      <div className="mt-6">
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard label="Revenue" value={formatCurrency(stats.revenue)} tone="pine" />
              <StatCard label="Orders" value={stats.totalOrders} />
              <StatCard label="Products" value={stats.totalProducts} />
              <StatCard label="Low stock" value={stats.lowStock} tone="brass" />
              <StatCard label="Out of stock" value={stats.outOfStock} tone="rust" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-line bg-surface p-5">
                <h2 className="stencil text-base font-semibold text-ink">Recent orders</h2>
                {orders.length === 0 ? (
                  <p className="mt-4 text-sm text-ink-muted">No orders yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line">
                    {orders.slice(0, 5).map((o) => (
                      <li key={o.order_id} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="font-mono text-ink">{o.order_id}</span>
                        <Badge tone={o.order_status === "delivered" ? "pine" : "brass"}>{o.order_status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-line bg-surface p-5">
                <h2 className="stencil text-base font-semibold text-ink">Store rating</h2>
                <div className="mt-3 flex items-center gap-2">
                  <span className="stencil text-3xl font-semibold text-ink">{storeProfile.rating}</span>
                  <StarRating rating={storeProfile.rating || 0} count={storeProfile.review_count || 0} size="md" />
                </div>
                <p className="mt-2 text-xs text-ink-muted">Based on {storeProfile.review_count || 0} customer reviews</p>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="stencil text-base font-semibold text-ink">Products &amp; Inventory</h2>
              <Button size="sm" variant="accent">+ Add product</Button>
            </div>
            {products.length === 0 ? (
              <EmptyState title="No products listed" description="Add your first product to start selling." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {products.map((p) => (
                      <tr key={p.product_id}>
                        <td className="flex items-center gap-3 px-4 py-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ivory">
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                          </div>
                          <span className="text-ink">{p.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.sku}</td>
                        <td className="px-4 py-3 font-mono text-ink">{formatCurrency(finalPrice(p))}</td>
                        <td className="px-4 py-3 text-ink">{p.stock}</td>
                        <td className="px-4 py-3">
                          {p.stock === 0 ? (
                            <Badge tone="rust">Out of stock</Badge>
                          ) : p.stock <= 10 ? (
                            <Badge tone="brass">Low stock</Badge>
                          ) : (
                            <Badge tone="pine">In stock</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 className="stencil mb-4 text-base font-semibold text-ink">Orders</h2>
            {orders.length === 0 ? (
              <EmptyState title="No orders yet" description="Orders containing your products will appear here." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map((o) => (
                      <tr key={o.order_id}>
                        <td className="px-4 py-3 font-mono text-ink">{o.order_id}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(o.order_purchase_timestamp)}</td>
                        <td className="px-4 py-3 font-mono text-ink">{formatCurrency(o.seller_total)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={o.order_status === "delivered" ? "pine" : "brass"}>{o.order_status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h2 className="stencil mb-4 text-base font-semibold text-ink">Customers</h2>
            {customers.length === 0 ? (
              <EmptyState title="No customers yet" description="Customers who buy from your store will show up here." />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line bg-surface">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="px-4 py-3">Customer ID</th>
                      <th className="px-4 py-3">Orders</th>
                      <th className="px-4 py-3">Total spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {customers.map((c) => (
                      <tr key={c.customer_id}>
                        <td className="px-4 py-3 font-mono text-ink">{c.customer_id}</td>
                        <td className="px-4 py-3 text-ink">{c.orders}</td>
                        <td className="px-4 py-3 font-mono text-ink">{formatCurrency(c.spend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h2 className="stencil mb-4 text-base font-semibold text-ink">Reviews</h2>
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="Reviews on your products will appear here." />
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.review_id} className="rounded-lg border border-line bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{r.productName}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>
                    <p className="mt-1 text-xs text-ink-muted">{r.customer_name} &middot; {formatDate(r.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "store" && (
          <div className="max-w-2xl rounded-lg border border-line bg-surface p-6">
            <h2 className="stencil text-base font-semibold text-ink">Store Profile</h2>
            <div className="mt-4 space-y-4">
              <Field label="Store name"><Input defaultValue={storeProfile.display_name} /></Field>
              <Field label="Store description">
                <textarea
                  defaultValue={`Seller based in ${storeProfile.seller_city || "-"}, ${storeProfile.seller_state || "-"}.`}
                  rows={3}
                  className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business email"><Input defaultValue={seller.email} /></Field>
                <Field label="Phone"><Input placeholder="Not available from Olist dataset" /></Field>
              </div>
              <Button variant="accent">Save changes</Button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="stencil text-base font-semibold text-ink">Account settings</h2>
              <div className="mt-4 space-y-4">
                <Field label="Business email"><Input defaultValue={seller.email} /></Field>
                <Field label="New password"><Input type="password" placeholder="Leave blank to keep current password" /></Field>
                <Button variant="accent">Update settings</Button>
              </div>
            </div>
            <div className="rounded-lg border border-rust/40 bg-rust-50 p-6">
              <h2 className="stencil text-base font-semibold text-rust">Danger zone</h2>
              <p className="mt-1 text-sm text-ink-soft">Deactivating your store hides it from customers immediately.</p>
              <Button variant="danger" className="mt-4">Deactivate store</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
