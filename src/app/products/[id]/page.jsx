"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProductById, fetchRelatedProducts } from "@/services/api/productService";
import { fetchReviewsByProduct, submitReview } from "@/services/api/reviewService";
import { fetchSellerProfile } from "@/services/api/sellerService";

const finalPrice = (p) => Math.round(p.price * (1 - (p.discount_percent || 0) / 100));
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProductGrid from "@/components/product/ProductGrid";
import ReviewList from "@/components/product/ReviewList";
import ReviewForm from "@/components/product/ReviewForm";
import EmptyState from "@/components/ui/EmptyState";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { customer, requireAuth } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviewData, setReviewData] = useState({ reviews: [], average: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    fetchProductById(id)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
        setQty(1);
        fetchRelatedProducts(p).then(setRelated);
        fetchReviewsByProduct(p.product_id).then(setReviewData);
        if (p.seller_id) fetchSellerProfile(p.seller_id).then(setSeller).catch(() => setSeller(null));
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Product not found"
          description="This listing may have been removed or the link is incorrect."
          actionLabel="Browse products"
          actionHref="/products"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-lg bg-ink/5" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded bg-ink/5" />
            <div className="h-4 w-1/3 rounded bg-ink/5" />
            <div className="h-10 w-1/2 rounded bg-ink/5" />
          </div>
        </div>
      </div>
    );
  }

  const price = finalPrice(product);
  const images = [product.image];
  const wishlisted = isWishlisted(product.product_id);
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    showToast(`Added ${qty} × ${product.name} to cart`, "success");
  };

  const handleWishlist = () => {
    if (!customer) {
      requireAuth("Sign in to save items to your wishlist.");
      return;
    }
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (payload) => {
    if (!customer) {
      requireAuth("Sign in to write a review.");
      return;
    }
    setSubmitting(true);
    const newReview = await submitReview(product.product_id, {
      customerName: `${customer.first_name} ${customer.last_name?.[0] || ""}.`,
      ...payload,
    });
    setReviewData((prev) => ({ reviews: [newReview, ...prev.reviews], average: prev.average }));
    setSubmitting(false);
    showToast("Thanks — your review has been posted.", "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/products?category=${product.category_slug}`} className="hover:text-ink">
          {product.category_name || "Products"}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-ivory">
            <Image src={images[activeImage]} alt={product.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />
            {product.discount_percent > 0 && (
              <Badge tone="rust" className="absolute left-3 top-3">-{product.discount_percent}%</Badge>
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{product.category_name}</span>
          <h1 className="stencil mt-1 text-2xl font-semibold text-ink sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={reviewData.average || product.rating} count={product.review_count} size="md" />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold text-ink">{formatCurrency(price)}</span>
            {product.discount_percent > 0 && (
              <span className="font-mono text-lg text-ink-muted line-through">{formatCurrency(product.price)}</span>
            )}
            {product.discount_percent > 0 && (
              <Badge tone="pine">You save {formatCurrency(product.price - price)}</Badge>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-5 flex items-center gap-2 text-sm">
            {inStock ? (
              <Badge tone="pine">In stock{product.stock <= 10 ? ` — only ${product.stock} left` : ""}</Badge>
            ) : (
              <Badge tone="rust">Out of stock</Badge>
            )}
          </div>

          {(product.seller_name || seller) && (
            <div className="mt-5 flex items-center justify-between rounded-lg border border-line bg-surface p-4">
              <div>
                <p className="text-xs text-ink-muted">Sold by</p>
                <p className="text-sm font-medium text-ink">
                  {product.seller_name}
                  {product.seller_city && ` — ${product.seller_city}, ${product.seller_state}`}
                </p>
              </div>
              {seller && <StarRating rating={seller.rating} count={seller.review_count} />}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded border border-line">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="px-3.5 py-2.5 text-ink-soft disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="px-3.5 py-2.5 text-ink-soft disabled:opacity-30"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <Button variant="primary" size="lg" onClick={handleAddToCart} disabled={!inStock} className="flex-1">
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <button
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className={`flex h-12 w-12 items-center justify-center rounded border ${
                wishlisted ? "border-rust text-rust" : "border-line text-ink-soft"
              }`}
            >
              <svg viewBox="0 0 24 24" fill={wishlisted ? "#B4472E" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4a5 5 0 016.5 2 5 5 0 016.5-2c3.5.5 4.8 4 4 7.5C19 15.65 12 20 12 20z" />
              </svg>
            </button>
          </div>

          <div className="mt-8">
            <h2 className="stencil text-base font-semibold text-ink">Specifications</h2>
            <dl className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
              {[
                ["Weight", product.weight_g ? `${product.weight_g} g` : null],
                ["Dimensions", product.length_cm ? `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm` : null],
                ["SKU", product.sku],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="text-right font-mono text-ink">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="stencil text-xl font-semibold text-ink">Ratings &amp; Reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReviewList reviews={reviewData.reviews} />
          </div>
          <div>
            <ReviewForm onSubmit={handleReviewSubmit} submitting={submitting} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="stencil text-xl font-semibold text-ink">You may also like</h2>
          <div className="mt-6">
            <ProductGrid products={related} loading={false} />
          </div>
        </section>
      )}
    </div>
  );
}
