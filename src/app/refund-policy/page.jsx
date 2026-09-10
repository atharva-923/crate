import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Refund Policy — Crate" };

export default function RefundPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Refund Policy"
      intro="Most items are eligible for a refund once a return is received and inspected by the seller."
    >
      <InfoSection title="Refund timeline">
        <p>
          Once your returned item is received and passes inspection, refunds are issued to your
          original payment method within 5–7 business days. UPI and card refunds are usually fastest;
          Cash on Delivery orders are refunded to a bank account you provide.
        </p>
      </InfoSection>
      <InfoSection title="What qualifies for a full refund">
        <p>
          Items returned unused, in original packaging, within the applicable return window (see our{" "}
          <a href="/returns-refunds" className="text-brass-700 underline">Returns &amp; Refunds</a>{" "}
          page) qualify for a full refund of the item price. Original delivery fees are refunded only
          if the return is due to a seller or delivery error.
        </p>
      </InfoSection>
      <InfoSection title="Partial refunds">
        <p>
          Items returned with visible use, missing accessories, or damaged packaging may receive a
          partial refund, at the seller's discretion, reflecting the reduced resale value.
        </p>
      </InfoSection>
      <InfoSection title="Non-refundable items">
        <p>
          Perishable goods, personal care items, and made-to-order products are marked as
          non-refundable on their product page unless they arrive defective or incorrect.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
