"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const finalPrice = (p) => Math.round(p.price * (1 - (p.discount_percent || 0) / 100));

const CartContext = createContext(null);
const CART_KEY = "crate_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          name: product.name,
          image: product.image,
          price: finalPrice(product),
          stock: product.stock,
          qty,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i
      )
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = 0;
    const deliveryFee = subtotal === 0 || subtotal >= 2999 ? 0 : 79;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal - discount + deliveryFee + tax;
    return { subtotal, discount, deliveryFee, tax, total };
  }, [items]);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, totals, itemCount, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
