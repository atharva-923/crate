"use client";

import { useState } from "react";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brass-700">Customer Support</p>
      <h1 className="stencil mt-2 text-3xl font-semibold text-ink">Contact Us</h1>
      <p className="mt-4 text-base text-ink-soft">
        We usually reply within one business day. For order-specific questions, include your order ID.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Email</p>
          <p className="mt-1 text-sm text-ink">support@crate.example</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Phone</p>
          <p className="mt-1 text-sm text-ink">+91 1800 123 4567</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Hours</p>
          <p className="mt-1 text-sm text-ink">Mon–Sat, 9am–7pm IST</p>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-line bg-surface p-6">
        {sent ? (
          <div className="rounded bg-pine-50 px-4 py-3 text-sm text-pine-600">
            Thanks for reaching out — we've received your message and will respond by email shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email address" required>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Subject" required>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </Field>
            <Field label="Message" required>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25"
              />
            </Field>
            <Button type="submit" variant="accent">Send message</Button>
          </form>
        )}
      </div>
    </div>
  );
}
