"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/services/api/authService";
import { isValidEmail } from "@/lib/validation";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setSubmitting(true);
    await requestPasswordReset({ email });
    setSubmitting(false);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="stencil text-center text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1.5 text-center text-sm text-ink-muted">
        Enter your account email and we'll send a link to reset your password.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        {sent ? (
          <div className="text-center">
            <div className="crate-stamp mx-auto flex h-12 w-12 items-center justify-center">✓</div>
            <p className="mt-4 text-sm text-ink">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
            <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brass-700 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email address" required error={error}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@example.com" />
            </Field>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-ink-muted hover:text-ink">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
