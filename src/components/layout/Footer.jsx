import Link from "next/link";

const columns = [
  {
    title: "Customer Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns-refunds" },
      { label: "Order Tracking", href: "/order-tracking" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/careers" },
      { label: "Our Story", href: "/our-story" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Sell on Crate", href: "/sell-on-crate" },
      { label: "Seller Registration", href: "/seller/register" },
      { label: "Seller Login", href: "/seller/login" },
      { label: "Seller Support", href: "/seller-support" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-conditions" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "X", href: "https://x.com" },
];

const trustBadges = [
  "Secure checkout",
  "Verified sellers",
  "Buyer protection",
  "7-day returns",
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink text-ivory/90">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-ivory/10 pb-8">
          {trustBadges.map((b) => (
            <span
              key={b}
              className="crate-stamp flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ivory border-ivory/40"
            >
              {b}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="stencil text-sm font-semibold uppercase tracking-wide text-brass-300">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ivory/75 hover:text-ivory">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-ivory/10 pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="crate-stamp flex h-8 w-8 items-center justify-center border-ivory/50">
              <span className="stencil text-xs font-bold">C</span>
            </span>
            <span className="stencil text-lg font-semibold">Crate</span>
            <span className="text-xs text-ivory/50">&copy; {new Date().getFullYear()} Crate Marketplace. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ivory/70 hover:text-ivory"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
