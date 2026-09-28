"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/services/api/categoryService";
import { cn } from "@/lib/utils";

export default function ProductFilters({ filters, onChange, className }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="stencil text-sm font-semibold text-ink">Category</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => set({ category: "" })}
              className="accent-brass"
            />
            All categories
          </label>
          {categories.map((c) => (
            <label key={c.category_id} className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                name="category"
                checked={filters.category === c.slug}
                onChange={() => set({ category: c.slug })}
                className="accent-brass"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="slat-divider" />

      <div>
        <h3 className="stencil text-sm font-semibold text-ink">Availability</h3>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => set({ inStockOnly: e.target.checked })}
            className="accent-brass"
          />
          In stock only
        </label>
      </div>

      <div className="slat-divider" />

      <div>
        <h3 className="stencil text-sm font-semibold text-ink">Sort by</h3>
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
          className="mt-3 w-full rounded border border-line bg-surface px-3 py-2 text-sm focus:border-brass focus:outline-none"
        >
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}
