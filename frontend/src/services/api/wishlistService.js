import { mockRequest } from "./client";

// In a real backend this hits /api/customers/:id/wishlist (GET/POST/DELETE).
// Here it's a thin pass-through so the WishlistContext already talks to a
// "service layer" instead of touching storage directly.
export function syncWishlist(items) {
  return mockRequest(() => items);
}
