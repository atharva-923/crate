import InfoPage, { InfoSection } from "@/components/layout/InfoPage";
import Link from "next/link";

export const metadata = { title: "Returns & Refunds — Crate" };

const steps = [
  "Go to your Order History and select the item you'd like to return.",
  "Choose a reason and confirm your pickup address.",
  "Hand the item to our pickup partner in its original packaging.",
  "Once inspected, your refund is issued within 5–7 business days.",
];

export default function ReturnsRefundsPage() {
  return (
    <InfoPage
      eyebrow="Customer Support"
      title="Returns & Refunds"
      intro="Most items can be returned within 7 days of delivery. Here's how the process works."
    >
      <InfoSection title="How to start a return">
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </InfoSection>
      <InfoSection title="Return window">
        <p>
          You have 7 days from the delivery date to request most returns. Some categories, like made-to-order
          furniture or personal care items, have shorter or no return windows — this is always shown on the
          product page before purchase.
        </p>
      </InfoSection>
      <InfoSection title="Refunds">
        <p>
          Refunds are issued to your original payment method after the returned item is inspected. See our
          full <Link href="/refund-policy" className="text-brass-700 underline">Refund Policy</Link> for
          timelines and exceptions.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
