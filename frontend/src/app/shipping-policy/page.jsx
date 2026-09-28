import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Shipping Policy — Crate" };

export default function ShippingPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Shipping Policy"
      intro="How orders are packed, dispatched, and delivered across our seller network."
    >
      <InfoSection title="Dispatch times">
        <p>
          Sellers dispatch orders within 24–48 hours of confirmation. Made-to-order or handcrafted
          items may take longer — this is noted on the product page before you buy.
        </p>
      </InfoSection>
      <InfoSection title="Delivery estimates">
        <p>
          Standard delivery takes 4–6 business days; express delivery, where available, takes 1–2
          business days. Estimates are shown at checkout based on your delivery address and the
          seller's location.
        </p>
      </InfoSection>
      <InfoSection title="Shipping fees">
        <p>
          Standard delivery is free on orders over ₹2,999. Orders below that threshold carry a flat
          ₹79 delivery fee. Express delivery carries an additional fee shown at checkout.
        </p>
      </InfoSection>
      <InfoSection title="Tracking your order">
        <p>
          Every order includes a tracking timeline available from{" "}
          <a href="/order-tracking" className="text-brass-700 underline">Order Tracking</a> or your{" "}
          <a href="/orders" className="text-brass-700 underline">order history</a>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
