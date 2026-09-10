"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories } from "@/services/api/categoryService";

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function IconHeart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4a5 5 0 016.5 2 5 5 0 016.5-2c3.5.5 4.8 4 4 7.5C19 15.65 12 20 12 20z" />
    </svg>
  );
}
function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-3.8 4.7-6 7.5-6s6 2.2 7.5 6" strokeLinecap="round" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { customer } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    router.push(query ? `/products?query=${encodeURIComponent(query)}` : "/products");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="lg:hidden text-ink"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <IconMenu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="crate-stamp flex h-9 w-9 items-center justify-center">
            <span className="stencil text-sm font-bold text-ink">C</span>
          </span>
          <span className="stencil text-xl font-semibold tracking-wide text-ink">Crate</span>
        </Link>

        <nav className="relative hidden lg:block">
          <button
            className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            Categories
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M5 7l5 6 5-6H5z" />
            </svg>
          </button>
          {catOpen && (
            <div
  className="absolute left-0 top-full max-h-[70vh] w-56 overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-2 shadow-lift"
  onMouseEnter={() => setCatOpen(true)}
  onMouseLeave={() => setCatOpen(false)}
>
              {categories.map((c) => (
                <Link
                  key={c.category_id}
                  href={`/products?category=${c.slug}`}
                  className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search for products, brands and more"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-muted focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/25"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink"
            aria-label="Wishlist"
          >
            <IconHeart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink"
            aria-label="Cart"
          >
            <IconBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-ink">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href={customer ? "/account" : "/login"}
            className="hidden sm:flex h-10 items-center gap-1.5 rounded-full px-3 text-ink-soft hover:bg-ink/5 hover:text-ink"
          >
            <IconUser className="h-5 w-5" />
            <span className="text-sm font-medium">
              {customer ? customer.first_name : "Account"}
            </span>
          </Link>
          <Link
            href="/seller/login"
            className="hidden lg:inline-flex items-center rounded border border-ink px-3.5 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-ivory"
          >
            Sell on Crate
          </Link>
        </div>
      </div>

      <form onSubmit={submitSearch} className="border-t border-line px-4 py-2.5 md:hidden">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search Crate"
            className="w-full rounded-full border border-line bg-surface py-2 pl-10 pr-4 text-sm focus:border-brass focus:outline-none"
          />
        </div>
      </form>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ivory p-5 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <span className="stencil text-lg font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <IconClose className="h-6 w-6 text-ink" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <Link href={customer ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 text-sm font-medium hover:bg-ink/5">
                {customer ? `Hi, ${customer.first_name}` : "Login / Create Account"}
              </Link>
              <div className="my-2 slat-divider" />
              <span className="px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Shop</span>
              {categories.map((c) => (
                <Link
                  key={c.category_id}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded px-3 py-2.5 text-sm hover:bg-ink/5"
                >
                  {c.name}
                </Link>
              ))}
              <div className="my-2 slat-divider" />
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 text-sm hover:bg-ink/5">Wishlist</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 text-sm hover:bg-ink/5">Orders</Link>
              <Link href="/help-center" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 text-sm hover:bg-ink/5">Help Center</Link>
              <div className="my-2 slat-divider" />
              <Link href="/seller/login" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 text-sm font-medium text-brass-700 hover:bg-brass-50">Sell on Crate</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
