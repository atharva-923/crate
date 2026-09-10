/**
 * Mock API client.
 *
 * In production this file becomes the only thing that changes: swap `mockRequest`
 * for real `fetch` calls against your Express/REST backend, e.g.
 *
 *   const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
 *   export async function request(path, options = {}) {
 *     const res = await fetch(`${BASE_URL}${path}`, {
 *       headers: { "Content-Type": "application/json", ...options.headers },
 *       ...options,
 *     });
 *     if (!res.ok) throw new ApiError(res.status, await res.json());
 *     return res.json();
 *   }
 *
 * Every function in services/api/* already returns a Promise, so components
 * never need to change when this swap happens.
 */

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const LATENCY_MS = 250;

export function mockRequest(resolver) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(resolver());
      } catch (err) {
        reject(err);
      }
    }, LATENCY_MS);
  });
}

// Real API client, talking to the Express + MySQL backend in /server.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (err) {
    // Network failure / API down — don't let this crash the UI.
    throw new ApiError(0, "Could not reach the Crate API. Please try again shortly.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || "Something went wrong.");
  }
  return res.json();
}
