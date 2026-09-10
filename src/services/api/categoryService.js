import { request } from "./client";

// GET /api/categories
export function fetchCategories() {
  return request("/api/categories");
}
