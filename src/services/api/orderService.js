import { request } from "./client";

// GET /api/customers/:id/orders
export function fetchOrdersByCustomer(customerId) {
  return request(`/api/customers/${customerId}/orders`);
}

// Maps a real Olist order_status + timestamps onto Crate's 5-stage timeline UI.
const STAGES = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

function normalizeOrder(raw) {
  const doneUpTo = {
    delivered: 4,
    shipped: 2,
    invoiced: 1,
    processing: 1,
    approved: 1,
    created: 0,
    unavailable: 0,
    canceled: 0,
  }[raw.order_status] ?? 0;

  const timeline = STAGES.map((status, idx) => ({
    status,
    done: idx <= doneUpTo,
    at:
      idx === 0
        ? raw.order_purchase_timestamp
        : idx === 1
        ? raw.order_approved_at
        : idx === 2
        ? raw.order_delivered_carrier_date
        : idx === 4
        ? raw.order_delivered_customer_date
        : null,
  }));

  const subtotal = raw.items.reduce((s, i) => s + Number(i.price), 0);
  const deliveryFee = raw.items.reduce((s, i) => s + Number(i.freight_value), 0);

  return {
    order_id: raw.order_id,
    placed_at: raw.order_purchase_timestamp,
    status: raw.order_status === "delivered" ? "Delivered" : STAGES[doneUpTo],
    timeline,
    items: raw.items.map((i) => ({
      product_id: i.product_id,
      name: i.product_name,
      image: i.image,
      qty: 1,
      price: Number(i.price),
    })),
    payment_method: raw.payments?.[0]?.payment_type || "—",
    subtotal,
    discount: 0,
    delivery_fee: Math.round(deliveryFee),
    tax: 0,
    total: Math.round(subtotal + deliveryFee),
    address: raw.customer
      ? {
          line1: "Address on file",
          line2: "",
          city: raw.customer.customer_city,
          state: raw.customer.customer_state,
          postal_code: "",
          country: "Brazil",
        }
      : { line1: "Address on file", line2: "", city: "-", state: "-", postal_code: "", country: "-" },
  };
}

// GET /api/orders/:id
export async function fetchOrderById(orderId) {
  try {
    const raw = await request(`/api/orders/${orderId}`);
    return normalizeOrder(raw);
  } catch {
    return null;
  }
}

// POST /api/orders
// Not implemented server-side yet — Crate's checkout flow still creates a
// local order object rather than writing to MySQL. Wiring this up means
// inserting into orders/order_items/payments inside a transaction
// (see server/sql/queries.sql §16 for the pattern) and is a good next step.
export function placeOrder(orderDraft) {
  return Promise.resolve({
    order_id: `CRT-${Math.floor(10000 + Math.random() * 89999)}`,
    placed_at: new Date().toISOString(),
    status: "Order Placed",
    timeline: STAGES.map((status, idx) => ({ status, done: idx === 0, at: idx === 0 ? new Date().toISOString() : null })),
    ...orderDraft,
  });
}
