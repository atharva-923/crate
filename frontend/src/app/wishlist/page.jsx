"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProductById } from "@/services/api/productService";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { customer } = useAuth();
  const [stockById, setStockById] = useState({});

  useEffect(() => {
    Promise.all(
      items.map((item) =>
        fetchProductById(item.product_id)
          .then((p) => [item.product_id, p.stock])
          .catch(() => [item.product_id, null])
      )
    ).then((pairs) => setStockById(Object.fromEntries(pairs)));
  }, [items]);

  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to view your wishlist"
          description="Save items you love and pick up where you left off, on any device."
          actionLabel="Log in"
          actionHref="/login"
        />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          actionLabel="Discover products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="stencil text-2xl font-semibold text-ink">Wishlist</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const stock = stockById[item.product_id];
          return (
            <div key={item.product_id} className="overflow-hidden rounded-lg border border-line bg-surface">
              <Link href={`/products/${item.product_id}`} className="relative block aspect-[4/5] bg-ivory">
                <Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover" />
              </Link>
              <div className="p-3.5">
                <Link href={`/products/${item.product_id}`} className="text-sm font-medium text-ink hover:underline line-clamp-2">
                  {item.name}
                </Link>
                <p className="mt-1 font-mono text-sm font-semibold text-ink">{formatCurrency(item.price)}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="accent"
                    className="flex-1"
                    disabled={stock === 0}
                    onClick={() => stock > 0 && addItem({ ...item, stock }, 1)}
                  >
                    {stock === 0 ? "Out of stock" : "Add to cart"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeFromWishlist(item.product_id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
