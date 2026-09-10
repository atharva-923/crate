"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const finalPrice = (p) => Math.round(p.price * (1 - (p.discount_percent || 0) / 100));
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";

function IconHeart({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "#B4472E" : "none"}
      stroke={filled ? "#B4472E" : "currentColor"}
      strokeWidth="1.8"
      className="h-4.5 w-4.5"
    >
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4a5 5 0 016.5 2 5 5 0 016.5-2c3.5.5 4.8 4 4 7.5C19 15.65 12 20 12 20z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { customer, requireAuth } = useAuth();
  const price = finalPrice(product);
  const wishlisted = isWishlisted(product.product_id);

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!customer) {
      requireAuth("Sign in to save items to your wishlist.");
      return;
    }
    toggleWishlist(product);
  };

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-soft"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.discount_percent > 0 && (
          <Badge tone="rust" className="absolute left-2.5 top-2.5">
            -{product.discount_percent}%
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="rounded bg-surface px-3 py-1 text-xs font-semibold text-ink">
              Out of stock
            </span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 shadow-soft"
        >
          <IconHeart filled={wishlisted} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {product.category_name}
        </span>
        <h3 className="text-sm font-medium text-ink line-clamp-2">{product.name}</h3>
        <StarRating rating={product.rating} count={product.review_count} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-mono text-base font-semibold text-ink">
            {formatCurrency(price)}
          </span>
          {product.discount_percent > 0 && (
            <span className="font-mono text-xs text-ink-muted line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
