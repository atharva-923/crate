import { request } from "./client";

/**
 * Mock auth. No real password storage or verification happens on the frontend —
 * in production, credentials are POSTed over HTTPS to the backend, which handles
 * hashing (bcrypt/argon2) and returns a session token / httpOnly cookie.
 */

// POST /api/auth/customer/login
export function loginCustomer({ email, password }) {
  return request("/api/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// POST /api/auth/customer/register
export function registerCustomer(payload) {
  return request("/api/auth/customer/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /api/auth/customer/logout
export function logoutCustomerApi() {
  return request("/api/auth/customer/logout", { method: "POST" });
}

// POST /api/auth/seller/login
export function loginSeller({ email, password }) {
  return request("/api/auth/seller/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// POST /api/auth/seller/register
export function registerSeller(payload) {
  return request("/api/auth/seller/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /api/auth/seller/logout
export function logoutSellerApi() {
  return request("/api/auth/seller/logout", { method: "POST" });
}

// POST /api/auth/forgot-password
export function requestPasswordReset({ email }) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
