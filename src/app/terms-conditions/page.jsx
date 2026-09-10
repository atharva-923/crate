import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Terms & Conditions — Crate" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Terms & Conditions"
      intro="Last updated August 2026. By using Crate, you agree to the terms below."
    >
      <InfoSection title="Using Crate">
        <p>
          You may browse and search Crate without an account. Creating an account requires accurate
          personal information and is limited to one account per person. You're responsible for
          keeping your login credentials secure.
        </p>
      </InfoSection>
      <InfoSection title="Orders and payment">
        <p>
          Placing an order is an offer to purchase, which we accept once payment is confirmed. Prices
          and availability may change before an order is confirmed. Sellers are responsible for the
          accuracy of their own listings.
        </p>
      </InfoSection>
      <InfoSection title="Selling on Crate">
        <p>
          Sellers must provide accurate business, tax, and verification details, list only items they
          can genuinely fulfil, and honor Crate's shipping and returns standards. Crate may suspend
          stores that violate these terms or receive repeated verified complaints.
        </p>
      </InfoSection>
      <InfoSection title="Limitation of liability">
        <p>
          Crate facilitates transactions between customers and independent sellers. While we vet
          sellers and monitor quality, Crate is not liable for indirect damages arising from a
          seller's products or a delivery partner's service.
        </p>
      </InfoSection>
      <InfoSection title="Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of Crate after changes take
          effect means you accept the revised terms.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
