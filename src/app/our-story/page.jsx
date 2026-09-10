import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Our Story — Crate" };

export default function OurStoryPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Our Story"
      intro="Crate started with a simple frustration: too many marketplaces made it hard to know who you were really buying from."
    >
      <InfoSection title="The beginning">
        <p>
          Our founders spent years buying from online marketplaces where listings looked identical
          regardless of who was behind them — a large distributor or a single person packing orders
          from their kitchen table. We wanted a platform where sellers could build a real reputation,
          and customers could see it.
        </p>
      </InfoSection>
      <InfoSection title="What Crate means to us">
        <p>
          A crate is how care travels — it's what protects something valuable on its way to you. That's
          the standard we hold every seller to: pack it well, ship it honestly, stand behind it after
          it arrives.
        </p>
      </InfoSection>
      <InfoSection title="Where we're headed">
        <p>
          We're building toward a marketplace with deeper seller verification, more transparent
          reviews, and faster, more predictable delivery — one category and one region at a time.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
