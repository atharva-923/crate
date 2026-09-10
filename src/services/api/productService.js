import { request } from "./client";

// GET /api/products?query=&category=&sort=&minPrice=&maxPrice=&inStockOnly=
export async function fetchProducts({ query = "", category = "", sort = "relevance", minPrice, maxPrice, inStockOnly = false } = {}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  if (typeof minPrice === "number") params.set("minPrice", minPrice);
  if (typeof maxPrice === "number") params.set("maxPrice", maxPrice);
  if (inStockOnly) params.set("inStockOnly", "true");

  const { products } = await request(`/api/products?${params.toString()}`);
  return products;
}

// GET /api/products/:id
export function fetchProductById(id) {
  return request(`/api/products/${id}`);
}

// GET /api/products/:id/related
export function fetchRelatedProducts(product, limit = 4) {
  return request(`/api/products/${product.product_id}/related?limit=${limit}`);
}
