"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-line py-5 last:border-0">
      <Link href={`/products/${item.product_id}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-ivory">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-3">
          <Link href={`/products/${item.product_id}`} className="text-sm font-medium text-ink hover:underline">
            {item.name}
          </Link>
          <span className="font-mono text-sm font-semibold text-ink whitespace-nowrap">
            {formatCurrency(item.price * item.qty)}
          </span>
        </div>
        {item.qty >= item.stock && (
          <p className="text-xs text-rust">Max available stock reached</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded border border-line">
            <button
              onClick={() => updateQty(item.product_id, item.qty - 1)}
              disabled={item.qty <= 1}
              className="px-3 py-1 text-ink-soft disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
            <button
              onClick={() => updateQty(item.product_id, item.qty + 1)}
              disabled={item.qty >= item.stock}
              className="px-3 py-1 text-ink-soft disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product_id)}
            className="text-xs font-medium text-ink-muted hover:text-rust"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
