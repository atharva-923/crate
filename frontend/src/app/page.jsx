"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/services/api/productService";
import { fetchCategories } from "@/services/api/categoryService";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";

const trustPoints = [
  {
    title: "Verified sellers only",
    desc: "Every store on Crate completes a business and identity check before listing.",
  },
  {
    title: "Secure checkout",
    desc: "Payments are encrypted end-to-end. We never store your full card details.",
  },
  {
    title: "7-day returns",
    desc: "Changed your mind? Most items can be returned within a week of delivery.",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts({ sort: "rating" })]).then(
      ([cats, res]) => {
        setCategories(cats);
        setBestsellers((res.products || res).slice(0, 8));
        setLoading(false);
      }
    );
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-slats">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="crate-stamp inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink">
              Packed with care, delivered with proof
            </span>
            <h1 className="stencil mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Everything you order,
              <br /> exactly as promised.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-soft">
              Crate connects you with verified independent sellers, backed by secure
              checkout, transparent tracking and hassle-free returns — on every single order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="link" href="/products" variant="primary" size="lg">
                Shop all products
              </Button>
              <Button as="link" href="/sell-on-crate" variant="outline" size="lg">
                Sell on Crate
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line shadow-lift">
              <Image
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=80"
                alt="Products packed carefully in a crate, ready for delivery"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="crate-stamp absolute -bottom-5 -left-5 hidden h-24 w-24 flex-col items-center justify-center bg-ivory text-center sm:flex">
              <span className="stencil text-lg font-bold text-ink">4.7</span>
              <span className="text-[10px] uppercase tracking-wide text-ink-muted">Avg. rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="stencil text-2xl font-semibold text-ink">Shop by category</h2>
          <Link href="/products" className="text-sm font-medium text-brass-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.category_id}
              href={`/products?category=${c.category_id}`}
              className="group flex flex-col items-center gap-2.5 rounded-lg border border-line bg-surface p-3 text-center transition-shadow hover:shadow-soft"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-ivory">
                <Image src={c.image} alt={c.name} fill sizes="64px" className="object-cover transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-medium text-ink-soft group-hover:text-ink">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="stencil text-2xl font-semibold text-ink">Highly rated this week</h2>
            <Link href="/products?sort=rating" className="text-sm font-medium text-brass-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={bestsellers} loading={loading} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {trustPoints.map((t) => (
            <div key={t.title} className="rounded-lg border border-line bg-surface p-6">
              <div className="crate-stamp flex h-10 w-10 items-center justify-center text-ink">
                ✓
              </div>
              <h3 className="stencil mt-4 text-base font-semibold text-ink">{t.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
