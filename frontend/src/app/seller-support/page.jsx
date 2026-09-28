import InfoPage, { InfoSection } from "@/components/layout/InfoPage";
import Link from "next/link";

export const metadata = { title: "Seller Support — Crate" };

const faqs = [
  {
    q: "How long does store verification take?",
    a: "Most stores are verified within 48 hours of submitting complete GST and PAN details.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts run weekly to the bank account you provided during registration, for all delivered orders.",
  },
  {
    q: "How do I update my product listings?",
    a: "Use the Products & Inventory tab in your Seller Dashboard to edit price, stock, and images.",
  },
  {
    q: "What if a customer disputes an order?",
    a: "Our support team reviews disputes using order and delivery records before deciding a resolution.",
  },
];

export default function SellerSupportPage() {
  return (
    <InfoPage
      eyebrow="Sellers"
      title="Seller Support"
      intro="Answers for store owners on Crate. For anything not covered here, reach our seller support team directly."
    >
      <InfoSection title="Common questions">
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-lg border border-line bg-surface p-4">
              <p className="text-sm font-medium text-ink">{f.q}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </InfoSection>
      <InfoSection title="Still need help?">
        <p>
          Log in to your{" "}
          <Link href="/seller/dashboard" className="text-brass-700 underline">Seller Dashboard</Link>{" "}
          and use the Settings tab, or reach us through{" "}
          <Link href="/contact-us" className="text-brass-700 underline">Contact Us</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
