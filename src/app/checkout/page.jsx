"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { placeOrder } from "@/services/api/orderService";
import { formatCurrency } from "@/lib/utils";
import { isValidPincode, required } from "@/lib/validation";
import Stepper from "@/components/ui/Stepper";
import Button from "@/components/ui/Button";
import Input, { Field } from "@/components/ui/Input";
import OrderSummary from "@/components/cart/OrderSummary";
import EmptyState from "@/components/ui/EmptyState";

const STEPS = ["Address", "Delivery", "Payment", "Review"];
const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard delivery", eta: "4–6 business days", fee: 0 },
  { id: "express", label: "Express delivery", eta: "1–2 business days", fee: 149 },
];
const PAYMENT_OPTIONS = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Credit / Debit Card" },
  { id: "cod", label: "Cash on Delivery" },
];

export default function CheckoutPage() {
  const { items, totals, itemCount, clearCart, hydrated } = useCart();
  const { customer } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const defaultAddress = customer?.addresses?.[0];
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    line1: defaultAddress?.line1 || "",
    line2: defaultAddress?.line2 || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    postalCode: defaultAddress?.postal_code || "",
    country: defaultAddress?.country || "India",
  });
  const [errors, setErrors] = useState({});
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);

  if (!hydrated) return null;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Nothing to check out" description="Your cart is empty." actionLabel="Shop products" actionHref="/products" />
      </div>
    );
  }

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.fee ?? 0;
  const finalTotals = { ...totals, deliveryFee: totals.deliveryFee + deliveryFee, total: totals.total + deliveryFee };

  const validateAddress = () => {
    const errs = {};
    if (!required(address.line1)) errs.line1 = "Address is required";
    if (!required(address.city)) errs.city = "City is required";
    if (!required(address.state)) errs.state = "State is required";
    if (!isValidPincode(address.postalCode)) errs.postalCode = "Enter a valid postal code";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateAddress()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    const order = await placeOrder({
      customer_id: customer.customer_id,
      payment_method: PAYMENT_OPTIONS.find((p) => p.id === payment)?.label,
      items: items.map((i) => ({ product_id: i.product_id, name: i.name, qty: i.qty, price: i.price })),
      subtotal: finalTotals.subtotal,
      discount: finalTotals.discount,
      delivery_fee: finalTotals.deliveryFee,
      tax: finalTotals.tax,
      total: finalTotals.total,
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
      },
    });
    clearCart();
    setPlacing(false);
    showToast("Order placed successfully!", "success");
    router.push(`/orders/${order.order_id}?justPlaced=1`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="stencil text-2xl font-semibold text-ink">Checkout</h1>
      <div className="mt-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-2">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="stencil text-lg font-semibold text-ink">Delivery Address</h2>
              <Field label="Address line 1" required error={errors.line1}>
                <Input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} error={errors.line1} />
              </Field>
              <Field label="Address line 2">
                <Input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" required error={errors.city}>
                  <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={errors.city} />
                </Field>
                <Field label="State" required error={errors.state}>
                  <Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} error={errors.state} />
                </Field>
                <Field label="Postal code" required error={errors.postalCode}>
                  <Input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} error={errors.postalCode} />
                </Field>
                <Field label="Country" required>
                  <Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="stencil text-lg font-semibold text-ink">Delivery Method</h2>
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                    delivery === opt.id ? "border-brass bg-brass-50/40" : "border-line"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="delivery" checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="accent-brass" />
                    <div>
                      <p className="text-sm font-medium text-ink">{opt.label}</p>
                      <p className="text-xs text-ink-muted">{opt.eta}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-ink">{opt.fee === 0 ? "Free" : formatCurrency(opt.fee)}</span>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="stencil text-lg font-semibold text-ink">Payment Method</h2>
              <p className="text-xs text-ink-muted">
                This is a demo checkout — no real payment details are collected or transmitted.
              </p>
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                    payment === opt.id ? "border-brass bg-brass-50/40" : "border-line"
                  }`}
                >
                  <input type="radio" name="payment" checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="accent-brass" />
                  <span className="text-sm font-medium text-ink">{opt.label}</span>
                </label>
              ))}
              {payment === "card" && (
                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <Field label="Card number">
                    <Input placeholder="•••• •••• •••• ••••" disabled />
                  </Field>
                  <Field label="Name on card">
                    <Input placeholder="As shown on card" disabled />
                  </Field>
                  <Field label="Expiry">
                    <Input placeholder="MM/YY" disabled />
                  </Field>
                  <Field label="CVV">
                    <Input placeholder="•••" disabled />
                  </Field>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="stencil text-lg font-semibold text-ink">Review Your Order</h2>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Ship to</p>
                <p className="mt-1 text-sm text-ink">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}, {address.country}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Delivery</p>
                <p className="mt-1 text-sm text-ink">{DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Payment</p>
                <p className="mt-1 text-sm text-ink">{PAYMENT_OPTIONS.find((p) => p.id === payment)?.label}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Items ({itemCount})</p>
                <ul className="mt-2 divide-y divide-line rounded border border-line">
                  {items.map((i) => (
                    <li key={i.product_id} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-ink-soft">{i.name} × {i.qty}</span>
                      <span className="font-mono text-ink">{formatCurrency(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next}>Continue</Button>
            ) : (
              <Button variant="accent" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? "Placing order..." : "Place Order"}
              </Button>
            )}
          </div>
        </div>

        <div>
          <OrderSummary totals={finalTotals} itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
}
