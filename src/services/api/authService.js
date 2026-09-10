import { mockRequest, ApiError } from "./client";
import { demoCustomer, demoSeller } from "@/data/users";

/**
 * Mock auth. No real password storage or verification happens on the frontend —
 * in production, credentials are POSTed over HTTPS to the backend, which handles
 * hashing (bcrypt/argon2) and returns a session token / httpOnly cookie.
 */

// POST /api/auth/customer/login
export function loginCustomer({ email, password }) {
  return mockRequest(() => {
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    if (password.length < 6) throw new ApiError(401, "Incorrect email or password");
    return { ...demoCustomer, email };
  });
}

// POST /api/auth/customer/register
export function registerCustomer(payload) {
  return mockRequest(() => {
    return {
      ...demoCustomer,
      customer_id: `cus_${Math.floor(Math.random() * 9000) + 1000}`,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      addresses: [
        {
          address_id: "addr_new",
          label: "Home",
          line1: payload.address,
          city: payload.city,
          state: payload.state,
          postal_code: payload.postalCode,
          country: payload.country || "India",
          is_default: true,
        },
      ],
    };
  });
}

// POST /api/auth/seller/login
export function loginSeller({ email, password }) {
  return mockRequest(() => {
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    if (password.length < 6) throw new ApiError(401, "Incorrect email or password");
    return { ...demoSeller, email };
  });
}

// POST /api/auth/seller/register
export function registerSeller(payload) {
  return mockRequest(() => {
    return {
      seller_id: `sel_${Math.floor(Math.random() * 9000) + 1000}`,
      store_name: payload.storeName,
      owner_name: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
      gst_number: payload.gstNumber,
      business_type: payload.businessType,
    };
  });
}

// POST /api/auth/forgot-password
export function requestPasswordReset({ email }) {
  return mockRequest(() => {
    if (!email) throw new ApiError(400, "Email is required");
    return { sent: true };
  });
}
