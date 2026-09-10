import { request } from "./client";

// GET /api/sellers/:id
export function fetchSellerProfile(sellerId) {
  return request(`/api/sellers/${sellerId}`);
}

// GET /api/sellers/:id/products
export function fetchSellerProducts(sellerId) {
  return request(`/api/sellers/${sellerId}/products`);
}

// GET /api/sellers/:id/orders
export function fetchSellerOrders(sellerId) {
  return request(`/api/sellers/${sellerId}/orders`);
}

// GET /api/sellers/:id/customers
export function fetchSellerCustomers(sellerId) {
  return request(`/api/sellers/${sellerId}/customers`);
}

// GET /api/sellers/:id/stats
export function fetchSellerStats(sellerId) {
  return request(`/api/sellers/${sellerId}/stats`);
}
