"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchProducts } from "@/services/api/productService";
import { fetchCategories } from "@/services/api/categoryService";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const query = searchParams.get("query") || "";
  const filters = useMemo(
    () => ({
      category: searchParams.get("category") || "",
      sort: searchParams.get("sort") || "relevance",
      inStockOnly: searchParams.get("inStockOnly") === "true",
    }),
    [searchParams]
  );

  useEffect(() => {
    setLoading(true);
    fetchProducts({ query, ...filters }).then((res) => {
      setProducts(res);
      setLoading(false);
    });
  }, [query, filters]);

  const updateFilters = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("query", query);
    if (next.category) params.set("category", next.category);
    else params.delete("category");
    if (next.sort && next.sort !== "relevance") params.set("sort", next.sort);
    else params.delete("sort");
    if (next.inStockOnly) params.set("inStockOnly", "true");
    else params.delete("inStockOnly");
    router.push(`/products?${params.toString()}`);
    setFiltersOpen(false);
  };

  const activeCategory = filters.category ? categories.find((c) => c.slug === filters.category) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {query ? `Results for "${query}"` : activeCategory ? activeCategory.name : "All products"}
        </p>
        <h1 className="stencil text-2xl font-semibold text-ink">
          {loading ? "Searching..." : `${products.length} products`}
        </h1>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <ProductFilters filters={filters} onChange={updateFilters} />
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setFiltersOpen(true)}
              className="rounded border border-ink px-3.5 py-2 text-sm font-medium text-ink"
            >
              Filters &amp; Sort
            </button>
          </div>
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 max-h-[85vh] w-full overflow-y-auto rounded-t-lg bg-ivory p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="stencil text-lg font-semibold">Filters &amp; Sort</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close" className="text-ink">✕</button>
            </div>
            <ProductFilters filters={filters} onChange={updateFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
