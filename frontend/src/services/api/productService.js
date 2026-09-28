import { request } from "./client";

// GET /api/products?query=&category=&sort=&minPrice=&maxPrice=&inStockOnly=&page=
export async function fetchProducts({ query = "", category = "", sort = "relevance", minPrice, maxPrice, inStockOnly = false, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (typeof minPrice === "number") params.set("minPrice", minPrice);
  if (typeof maxPrice === "number") params.set("maxPrice", maxPrice);
  if (inStockOnly) params.set("inStockOnly", "true");
  params.set("page", page);
  params.set("limit", 25);

  // Returns { products, page, limit, total }
  return request(`/api/products?${params.toString()}`);
}

// GET /api/products/:id
export function fetchProductById(id) {
  return request(`/api/products/${id}`);
}

// GET /api/products/:id/related
export function fetchRelatedProducts(product, limit = 4) {
  return request(`/api/products/${product.product_id}/related?limit=${limit}`);
}
