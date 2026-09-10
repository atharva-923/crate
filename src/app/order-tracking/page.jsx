"use client";

import { useState } from "react";
import { fetchOrderById } from "@/services/api/orderService";
import { formatDate } from "@/lib/utils";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    const order = await fetchOrderById(orderId.trim().toUpperCase());
    setResult(order || null);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">Customer Support</p>
      <h1 className="stencil mt-2 text-3xl font-semibold text-ink">Order Tracking</h1>
      <p className="mt-4 text-base text-ink-soft">
        Enter your order ID to see the latest status — no login required.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex items-end gap-3">
        <div className="flex-1">
          <Field label="Order ID">
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. CRT-88214"
              className="font-mono"
            />
          </Field>
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Searching..." : "Track order"}
        </Button>
      </form>
      <p className="mt-2 text-xs text-ink-muted">Try a demo order ID: CRT-88214 or CRT-87550</p>

      {result === null && (
        <div className="mt-8 rounded-lg border border-line bg-surface p-5 text-sm text-ink-soft">
          We couldn't find an order with that ID. Double check it and try again, or{" "}
          <a href="/help-center" className="text-brass-700 underline">contact support</a>.
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-lg border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-semibold text-ink">{result.order_id}</p>
              <p className="text-xs text-ink-muted">Placed on {formatDate(result.placed_at)}</p>
            </div>
            <Badge tone={result.status === "Delivered" ? "pine" : "brass"}>{result.status}</Badge>
          </div>
          <ol className="mt-6 space-y-4">
            {result.timeline.map((step, idx) => (
              <li key={step.status} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                    step.done ? "border-pine bg-pine text-white" : "border-line text-ink-muted"
                  }`}
                >
                  {step.done ? "✓" : idx + 1}
                </span>
                <span className={`text-sm ${step.done ? "text-ink" : "text-ink-muted"}`}>{step.status}</span>
                {step.at && <span className="ml-auto text-xs text-ink-muted">{formatDate(step.at)}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
