import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata = { title: "Sell on Crate" };

const steps = [
  { title: "Register your store", desc: "Tell us about your business and complete verification." },
  { title: "List your products", desc: "Add photos, pricing, and stock — approval usually takes under 48 hours." },
  { title: "Start selling", desc: "Manage orders, track revenue and reply to reviews from your dashboard." },
];

const perks = [
  "No listing fees — pay a small commission only when you sell",
  "Weekly payouts to your linked bank account",
  "Dashboard for inventory, orders and revenue in one place",
  "Access to Crate's buyer protection and support team",
];

export default function SellOnCratePage() {
  return (
    <div>
      <section className="border-b border-line bg-slats">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="crate-stamp inline-flex px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink">
              For independent sellers
            </span>
            <h1 className="stencil mt-5 text-4xl font-semibold leading-tight text-ink">
              Bring your store to Crate
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-soft">
              Join a marketplace where verified sellers get discovered by customers who value quality
              and trust — with tools built for stores of any size.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="link" href="/seller/register" variant="primary" size="lg">
                Register your store
              </Button>
              <Button as="link" href="/seller/login" variant="outline" size="lg">
                Seller login
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1000&q=80"
              alt="Seller preparing products for shipment"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="stencil text-2xl font-semibold text-ink">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <div key={s.title} className="rounded-lg border border-line bg-surface p-6">
              <span className="crate-stamp flex h-9 w-9 items-center justify-center stencil text-sm font-bold text-ink">
                {idx + 1}
              </span>
              <h3 className="stencil mt-4 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="stencil text-2xl font-semibold text-ink">Why sell on Crate</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <span className="mt-0.5 text-pine-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button as="link" href="/seller/register" variant="accent" size="lg">
              Get started
            </Button>
            <Link href="/seller-support" className="ml-4 text-sm font-medium text-brass-700 hover:underline">
              Have questions? Visit Seller Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
