"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/services/api/authService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail, isValidPhone, isValidPincode, isStrongPassword, required } from "@/lib/validation";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function RegisterPage() {
  const router = useRouter();
  const { loginCustomerSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(form.firstName)) errs.firstName = "First name is required";
    if (!required(form.lastName)) errs.lastName = "Last name is required";
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (!isValidPhone(form.phone)) errs.phone = "Enter a valid phone number";
    if (!isStrongPassword(form.password)) errs.password = "Use at least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!required(form.address)) errs.address = "Address is required";
    if (!required(form.city)) errs.city = "City is required";
    if (!required(form.state)) errs.state = "State is required";
    if (!isValidPincode(form.postalCode)) errs.postalCode = "Enter a valid postal code";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const customer = await registerCustomer(form);
      loginCustomerSession(customer);
      showToast(`Welcome to Crate, ${customer.first_name}!`, "success");
      router.push("/account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="stencil text-center text-2xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1.5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brass-700 hover:underline">Log in</Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg border border-line bg-surface p-6">
        <div>
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">Personal details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="First name" required error={errors.firstName}>
              <Input value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            </Field>
            <Field label="Email address" required error={errors.email}>
              <Input type="email" value={form.email} onChange={set("email")} error={errors.email} />
            </Field>
            <Field label="Phone number" required error={errors.phone}>
              <Input type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
            </Field>
            <Field label="Password" required error={errors.password} hint="At least 8 characters">
              <Input type="password" value={form.password} onChange={set("password")} error={errors.password} />
            </Field>
            <Field label="Confirm password" required error={errors.confirmPassword}>
              <Input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
            </Field>
          </div>
        </div>

        <div className="slat-divider" />

        <div>
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">Delivery address</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Address" required error={errors.address} className="sm:col-span-2">
              <Input value={form.address} onChange={set("address")} error={errors.address} />
            </Field>
            <Field label="City" required error={errors.city}>
              <Input value={form.city} onChange={set("city")} error={errors.city} />
            </Field>
            <Field label="State" required error={errors.state}>
              <Input value={form.state} onChange={set("state")} error={errors.state} />
            </Field>
            <Field label="Postal code" required error={errors.postalCode}>
              <Input value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} />
            </Field>
            <Field label="Country" required>
              <Input value={form.country} onChange={set("country")} />
            </Field>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          By creating an account you agree to Crate's{" "}
          <Link href="/terms-conditions" className="underline">Terms &amp; Conditions</Link> and{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}
