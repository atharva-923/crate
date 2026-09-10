"use client";

import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const WISHLIST_KEY = "crate_wishlist";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const isWishlisted = (productId) => items.some((i) => i.product_id === productId);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      if (prev.some((i) => i.product_id === product.product_id)) {
        return prev.filter((i) => i.product_id !== product.product_id);
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          name: product.name,
          image: product.images[0],
          price: product.price,
        },
      ];
    });
  };

  const removeFromWishlist = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
