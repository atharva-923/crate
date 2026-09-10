import InfoPage, { InfoSection } from "@/components/layout/InfoPage";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "Careers — Crate" };

const openRoles = [
  { title: "Frontend Engineer", team: "Product", location: "Pune / Remote" },
  { title: "Seller Operations Associate", team: "Marketplace", location: "Bengaluru" },
  { title: "Customer Support Specialist", team: "Support", location: "Remote" },
  { title: "Logistics Partnerships Manager", team: "Operations", location: "Mumbai" },
];

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Careers at Crate"
      intro="We're a small team building a marketplace people can trust. Here's what's open right now."
    >
      <InfoSection title="Open roles">
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {openRoles.map((role) => (
            <li key={role.title} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink">{role.title}</p>
                <p className="text-xs text-ink-muted">{role.team} &middot; {role.location}</p>
              </div>
              <Badge tone="brass">Hiring</Badge>
            </li>
          ))}
        </ul>
      </InfoSection>
      <InfoSection title="How to apply">
        <p>
          Send your resume and a short note about why you'd like to work on Crate through our{" "}
          <a href="/contact-us" className="text-brass-700 underline">Contact Us</a> page, and mention
          the role you're interested in.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
