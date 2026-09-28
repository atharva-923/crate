import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Cookie Policy — Crate" };

export default function CookiePolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Cookie Policy"
      intro="Crate uses cookies and similar local storage to keep your cart, wishlist, and session working smoothly."
    >
      <InfoSection title="Essential storage">
        <p>
          We use local browser storage to remember your cart contents, wishlist, and login session so
          you don't lose them between visits. Without this storage, core features like checkout won't
          work correctly.
        </p>
      </InfoSection>
      <InfoSection title="Analytics">
        <p>
          We may use privacy-conscious analytics to understand which pages are useful and where
          customers run into trouble, so we can improve Crate over time.
        </p>
      </InfoSection>
      <InfoSection title="Managing storage">
        <p>
          You can clear your browser's local storage at any time from your browser settings — this
          will log you out and empty your cart and wishlist on this device.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
