"use client";

import { useState } from "react";

const faqGroups = [
  {
    title: "Orders & Payment",
    items: [
      { q: "What payment methods do you accept?", a: "Crate supports UPI, major credit and debit cards, and Cash on Delivery in select areas." },
      { q: "Can I cancel my order?", a: "Orders can be cancelled before they're marked as Shipped. After that, you can request a return once it's delivered." },
      { q: "How do I track my order?", a: "Visit Order Tracking or your order history and enter your order ID to see live status." },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 4–6 business days; express delivery takes 1–2 business days where available." },
      { q: "Is delivery free?", a: "Yes, on orders over ₹2,999. Smaller orders carry a flat ₹79 delivery fee." },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      { q: "What's the return window?", a: "Most items can be returned within 7 days of delivery, unused and in original packaging." },
      { q: "When will I get my refund?", a: "Refunds are issued within 5–7 business days after the returned item passes inspection." },
    ],
  },
  {
    title: "Account",
    items: [
      { q: "Do I need an account to shop?", a: "No — you can browse and search freely. An account is only needed for checkout, wishlist, and order history." },
      { q: "How do I reset my password?", a: "Use the Forgot Password link on the login page to receive a reset link by email." },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line py-3.5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink">{q}</span>
        <span className="text-lg text-ink-muted">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-2 text-sm text-ink-soft">{a}</p>}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">Customer Support</p>
      <h1 className="stencil mt-2 text-3xl font-semibold text-ink">Frequently Asked Questions</h1>

      <div className="mt-10 space-y-10">
        {faqGroups.map((group) => (
          <div key={group.title}>
            <h2 className="stencil text-lg font-semibold text-ink">{group.title}</h2>
            <div className="mt-2 rounded-lg border border-line bg-surface px-4">
              {group.items.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
