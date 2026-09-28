"use client";

import { useState } from "react";
import Link from "next/link";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const topics = [
  {
    title: "Orders & Payment",
    items: [
      "How do I check my order status?",
      "Which payment methods does Crate accept?",
      "Can I change or cancel an order after placing it?",
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      "How do I start a return?",
      "How long do refunds take?",
      "What items can't be returned?",
    ],
  },
  {
    title: "Account & Security",
    items: [
      "How do I reset my password?",
      "How do I update my delivery address?",
      "Is my payment information stored?",
    ],
  },
  {
    title: "Selling on Crate",
    items: [
      "How do I register as a seller?",
      "How do I list a new product?",
      "When do sellers get paid?",
    ],
  },
];

export default function HelpCenterPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "Orders & Payment", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">Customer Support</p>
      <h1 className="stencil mt-2 text-3xl font-semibold text-ink">Help Center</h1>
      <p className="mt-4 max-w-xl text-base text-ink-soft">
        Browse common topics below, or send our support team a message and we'll get back to you.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {topics.map((t) => (
          <div key={t.title} className="rounded-lg border border-line bg-surface p-5">
            <h2 className="stencil text-base font-semibold text-ink">{t.title}</h2>
            <ul className="mt-3 space-y-2">
              {t.items.map((item) => (
                <li key={item}>
                  <Link href="/faqs" className="text-sm text-brass-700 hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-lg border border-line bg-surface p-6">
        <h2 className="stencil text-lg font-semibold text-ink">Contact support</h2>
        {sent ? (
          <div className="mt-4 rounded bg-pine-50 px-4 py-3 text-sm text-pine-600">
            Thanks — your message has been received. Our team typically replies within one business day.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email address" required>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Topic">
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
              >
                {topics.map((t) => <option key={t.title}>{t.title}</option>)}
                <option>Press & Media</option>
                <option>Something else</option>
              </select>
            </Field>
            <Field label="Message" required>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25"
                placeholder="How can we help?"
              />
            </Field>
            <Button type="submit" variant="accent">Send message</Button>
          </form>
        )}
      </div>
    </div>
  );
}
