import { request } from "./client";

// GET /api/products/:id/reviews
export function fetchReviewsByProduct(productId) {
  return request(`/api/reviews/${productId}`);
}

// POST /api/products/:id/reviews
// Olist reviews are tied to real orders — this endpoint is a documented
// 501 stub server-side until checkout creates real order_ids. See
// server/routes/reviews.js.
export function submitReview(productId, payload) {
  return request(`/api/reviews/${productId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
