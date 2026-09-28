// Static status labels used by the order-tracking UI. Actual order data now
// comes from the real orders/order_items/payments tables via
// services/api/orderService.js (see normalizeOrder there).
export const orderStatuses = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];
