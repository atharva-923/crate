import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "Press — Crate" };

export default function PressPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Press"
      intro="Resources and contact details for journalists and media covering Crate."
    >
      <InfoSection title="Media inquiries">
        <p>
          For interviews, data requests, or comment on a story involving Crate, reach out through our{" "}
          <a href="/contact-us" className="text-brass-700 underline">Contact Us</a> page and select
          "Press &amp; Media" as the topic.
        </p>
      </InfoSection>
      <InfoSection title="Brand assets">
        <p>
          A press kit with our logo, wordmark, and brand guidelines is available on request while we
          finalize a public downloads page.
        </p>
      </InfoSection>
      <InfoSection title="In the news">
        <p>
          We don't have any published coverage to share yet — check back as Crate grows, or follow us
          on social media for announcements.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
