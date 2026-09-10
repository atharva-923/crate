"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSeller } from "@/services/api/authService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail, isValidPhone, isValidPincode, isStrongPassword, required } from "@/lib/validation";
import Input, { Field } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const initialForm = {
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  storeName: "",
  businessType: "Sole Proprietorship",
  storeDescription: "",
  gstNumber: "",
  panNumber: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  bankAccountName: "",
  bankAccountNumber: "",
  ifscCode: "",
};

export default function SellerRegisterPage() {
  const router = useRouter();
  const { loginSellerSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!required(form.ownerName)) errs.ownerName = "Owner name is required";
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (!isValidPhone(form.phone)) errs.phone = "Enter a valid phone number";
    if (!isStrongPassword(form.password)) errs.password = "Use at least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!required(form.storeName)) errs.storeName = "Store name is required";
    if (!required(form.storeDescription)) errs.storeDescription = "Tell customers what you sell";
    if (!/^[0-9A-Z]{15}$/.test(form.gstNumber)) errs.gstNumber = "Enter a valid 15-character GSTIN";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)) errs.panNumber = "Enter a valid PAN";
    if (!required(form.addressLine1)) errs.addressLine1 = "Store address is required";
    if (!required(form.city)) errs.city = "City is required";
    if (!required(form.state)) errs.state = "State is required";
    if (!isValidPincode(form.postalCode)) errs.postalCode = "Enter a valid postal code";
    if (!required(form.bankAccountName)) errs.bankAccountName = "Required for payouts";
    if (!/^\d{9,18}$/.test(form.bankAccountNumber)) errs.bankAccountNumber = "Enter a valid account number";
    if (!/^[A-Z]{4}0[0-9A-Z]{6}$/.test(form.ifscCode)) errs.ifscCode = "Enter a valid IFSC code";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const seller = await registerSeller(form);
      loginSellerSession(seller);
      showToast(`Store submitted! Welcome, ${seller.store_name}.`, "success");
      router.push("/seller/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="stencil text-center text-2xl font-semibold text-ink">Register your store</h1>
      <p className="mt-1.5 text-center text-sm text-ink-muted">
        Already have a seller account?{" "}
        <Link href="/seller/login" className="font-medium text-brass-700 hover:underline">Log in</Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg border border-line bg-surface p-6">
        <div>
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">Personal details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Owner / contact name" required error={errors.ownerName}>
              <Input value={form.ownerName} onChange={set("ownerName")} error={errors.ownerName} />
            </Field>
            <Field label="Business email" required error={errors.email}>
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
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">Store details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Store name" required error={errors.storeName}>
              <Input value={form.storeName} onChange={set("storeName")} error={errors.storeName} />
            </Field>
            <Field label="Business type" required>
              <select
                value={form.businessType}
                onChange={set("businessType")}
                className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
              >
                <option>Sole Proprietorship</option>
                <option>Partnership</option>
                <option>Private Limited Company</option>
                <option>LLP</option>
              </select>
            </Field>
            <Field label="Store description" required error={errors.storeDescription} className="sm:col-span-2">
              <textarea
                value={form.storeDescription}
                onChange={set("storeDescription")}
                rows={3}
                className="w-full rounded border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25"
                placeholder="What do you sell, and what makes your store different?"
              />
            </Field>
          </div>
        </div>

        <div className="slat-divider" />

        <div>
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Business verification
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Required so we can verify your store and list it as a trusted Crate seller.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="GSTIN" required error={errors.gstNumber} hint="15 characters, e.g. 27ABCDE1234F1Z5">
              <Input value={form.gstNumber} onChange={set("gstNumber")} error={errors.gstNumber} className="uppercase" />
            </Field>
            <Field label="PAN" required error={errors.panNumber} hint="e.g. ABCDE1234F">
              <Input value={form.panNumber} onChange={set("panNumber")} error={errors.panNumber} className="uppercase" />
            </Field>
            <Field label="Store address" required error={errors.addressLine1} className="sm:col-span-2">
              <Input value={form.addressLine1} onChange={set("addressLine1")} error={errors.addressLine1} />
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
          </div>
        </div>

        <div className="slat-divider" />

        <div>
          <h2 className="stencil text-sm font-semibold uppercase tracking-wide text-ink-muted">Payout details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Account holder name" required error={errors.bankAccountName}>
              <Input value={form.bankAccountName} onChange={set("bankAccountName")} error={errors.bankAccountName} />
            </Field>
            <Field label="Account number" required error={errors.bankAccountNumber}>
              <Input value={form.bankAccountNumber} onChange={set("bankAccountNumber")} error={errors.bankAccountNumber} />
            </Field>
            <Field label="IFSC code" required error={errors.ifscCode}>
              <Input value={form.ifscCode} onChange={set("ifscCode")} error={errors.ifscCode} className="uppercase" />
            </Field>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit for verification"}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          By registering you agree to Crate's{" "}
          <Link href="/terms-conditions" className="underline">Terms &amp; Conditions</Link> for sellers.
        </p>
      </form>
    </div>
  );
}
