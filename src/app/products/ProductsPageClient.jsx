"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchProducts } from "@/services/api/productService";
import { fetchCategories } from "@/services/api/categoryService";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink-soft transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {left > 1 && (
        <>
          <button onClick={() => onPage(1)} className="flex h-9 w-9 items-center justify-center rounded border border-line text-sm text-ink-soft transition hover:border-ink hover:text-ink">1</button>
          {left > 2 && <span className="px-1 text-ink-muted">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`flex h-9 w-9 items-center justify-center rounded border text-sm font-medium transition ${
            p === page
              ? "border-brass bg-brass text-ink"
              : "border-line text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          {p}
        </button>
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="px-1 text-ink-muted">…</span>}
          <button onClick={() => onPage(totalPages)} className="flex h-9 w-9 items-center justify-center rounded border border-line text-sm text-ink-soft transition hover:border-ink hover:text-ink">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink-soft transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);

  const LIMIT = 25;

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

  // Reset to page 1 whenever filters/query change
  useEffect(() => {
    setPage(1);
  }, [query, filters]);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ query, ...filters, page }).then((res) => {
      setProducts(res.products);
      setTotal(res.total);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [query, filters, page]);

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

  const totalPages = Math.ceil(total / LIMIT);
  const activeCategory = filters.category ? categories.find((c) => c.slug === filters.category) : null;
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {query ? `Results for "${query}"` : activeCategory ? activeCategory.name : "All products"}
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="stencil text-2xl font-semibold text-ink">
            {loading ? "Searching..." : `${total.toLocaleString()} products`}
          </h1>
          {!loading && total > 0 && (
            <span className="text-sm text-ink-muted">
              Showing {start}–{end}
            </span>
          )}
        </div>
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
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
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
