"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartItem from "@/components/cart/CartItem";
import OrderSummary from "@/components/cart/OrderSummary";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, totals, itemCount, hydrated } = useCart();
  const { customer, requireAuth } = useAuth();
  const router = useRouter();

  const goToCheckout = () => {
    if (!customer) {
      requireAuth("Sign in to check out.");
      return;
    }
    router.push("/checkout");
  };

  if (!hydrated) return null;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Browse our catalog and add something you'll love."
          actionLabel="Start shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="stencil text-2xl font-semibold text-ink">Shopping Cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface px-5 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.product_id} item={item} />
          ))}
        </div>
        <div>
          <OrderSummary totals={totals} itemCount={itemCount}>
            <Button variant="accent" className="mt-5 w-full" size="lg" onClick={goToCheckout}>
              Proceed to Checkout
            </Button>
            <Link href="/products" className="mt-3 block text-center text-sm text-ink-muted hover:text-ink">
              Continue shopping
            </Link>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
