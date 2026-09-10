import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Privacy Policy — Crate" };

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Privacy Policy"
      intro="Last updated August 2026. This policy explains what information Crate collects, how we use it, and the choices you have."
    >
      <InfoSection title="Information we collect">
        <p>
          When you create an account, place an order, or contact support, we collect details such as
          your name, email, phone number, delivery addresses, and order history. Sellers additionally
          provide business and verification details when registering a store.
        </p>
      </InfoSection>
      <InfoSection title="How we use your information">
        <p>
          We use your information to process orders, provide customer support, personalize your
          shopping experience, prevent fraud, and communicate updates about your orders or account.
          We do not sell your personal information to third parties.
        </p>
      </InfoSection>
      <InfoSection title="Sharing with sellers and partners">
        <p>
          Sellers receive the information needed to fulfil your order — your name, delivery address,
          and order contents. Payment processors and delivery partners receive only what's necessary
          to complete a transaction or shipment.
        </p>
      </InfoSection>
      <InfoSection title="Your choices">
        <p>
          You can review and update your account details at any time from your account page, request
          a copy of your data, or ask us to delete your account by contacting support.
        </p>
      </InfoSection>
      <InfoSection title="Contact us">
        <p>
          Questions about this policy can be sent through our{" "}
          <a href="/contact-us" className="text-brass-700 underline">Contact Us</a> page.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
