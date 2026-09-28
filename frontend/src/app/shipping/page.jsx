import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Shipping — Crate" };

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Customer Support"
      title="Shipping"
      intro="What to expect once you place an order — from dispatch to your doorstep."
    >
      <InfoSection title="Delivery timelines">
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Estimated delivery</th>
                <th className="px-4 py-2.5">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              <tr>
                <td className="px-4 py-2.5">Standard</td>
                <td className="px-4 py-2.5">4–6 business days</td>
                <td className="px-4 py-2.5">Free over ₹2,999, else ₹79</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">Express</td>
                <td className="px-4 py-2.5">1–2 business days</td>
                <td className="px-4 py-2.5">₹149</td>
              </tr>
            </tbody>
          </table>
        </div>
      </InfoSection>
      <InfoSection title="Order tracking">
        <p>
          Every order includes a step-by-step tracking timeline, from Order Placed through Delivered.
          Find yours under <a href="/order-tracking" className="text-brass-700 underline">Order Tracking</a>.
        </p>
      </InfoSection>
      <InfoSection title="Delivery issues">
        <p>
          If your order is delayed beyond the estimate or arrives damaged, contact our{" "}
          <a href="/help-center" className="text-brass-700 underline">Help Center</a> with your order ID
          and we'll make it right.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
