"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSeller } from "@/services/api/authService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail, required } from "@/lib/validation";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SellerLoginPage() {
  const router = useRouter();
  const { loginSellerSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (!required(form.password)) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      const seller = await loginSeller(form);
      loginSellerSession(seller);
      showToast(`Welcome back, ${seller.store_name}`, "success");
      router.push("/seller/dashboard");
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="crate-stamp mx-auto flex h-12 w-12 items-center justify-center">
        <span className="stencil text-lg font-bold text-ink">C</span>
      </div>
      <h1 className="stencil mt-5 text-center text-2xl font-semibold text-ink">Seller Login</h1>
      <p className="mt-1.5 text-center text-sm text-ink-muted">
        New to selling on Crate?{" "}
        <Link href="/seller/register" className="font-medium text-brass-700 hover:underline">
          Register your store
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-line bg-surface p-6">
        {serverError && <p className="rounded bg-rust-50 px-3 py-2 text-sm text-rust">{serverError}</p>}
        <Field label="Business email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        </Field>
        <Field label="Password" required error={errors.password}>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in to dashboard"}
        </Button>
        <p className="text-center text-xs text-ink-muted">Demo tip: use any email and a password with 6+ characters.</p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Shopping instead?{" "}
        <Link href="/login" className="font-medium text-brass-700 hover:underline">Customer login</Link>
      </p>
    </div>
  );
}
