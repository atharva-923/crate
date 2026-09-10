import Image from "next/image";
import InfoPage from "@/components/layout/InfoPage";

export const metadata = { title: "Blog — Crate" };

const posts = [
  {
    title: "How we verify every seller on Crate",
    excerpt: "A look at the checks a store goes through before it can list a single product.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80",
    date: "July 2026",
  },
  {
    title: "Behind the crate: packing for damage-free delivery",
    excerpt: "What our top-rated sellers do differently when it comes to packaging.",
    image: "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=700&q=80",
    date: "June 2026",
  },
  {
    title: "5 small home studios to know this season",
    excerpt: "Independent makers on Crate worth adding to your wishlist.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&q=80",
    date: "May 2026",
  },
];

export default function BlogPage() {
  return (
    <InfoPage eyebrow="About" title="The Crate Blog" intro="Notes on sellers, products, and what we're building.">
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article key={post.title} className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="relative aspect-[16/10]">
              <Image src={post.image} alt={post.title} fill sizes="350px" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-muted">{post.date}</p>
              <h3 className="stencil mt-1 text-base font-semibold text-ink">{post.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </InfoPage>
  );
}
