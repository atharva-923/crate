const express = require("express");
const pool = require("../db");
const { asyncHandler } = require("../utils");

const router = express.Router();

// GET /api/customers/:id/orders
router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT o.order_id,
              o.order_status AS status,
              o.order_purchase_timestamp AS placed_at,
              COALESCE(SUM(DISTINCT p.payment_value), 0) AS total,
              COUNT(DISTINCT oi.order_item_id) AS item_count
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.order_id
       LEFT JOIN order_items oi ON oi.order_id = o.order_id
       WHERE o.customer_id = ?
       GROUP BY o.order_id
       ORDER BY o.order_purchase_timestamp DESC
       LIMIT 20`,
      [req.params.id]
    );
    const normalized = rows.map(o => ({
      order_id: o.order_id,
      placed_at: o.placed_at,
      status: o.status === "delivered" ? "Delivered" : o.status === "shipped" ? "Shipped" : "Processing",
      total: Number(o.total),
      items: Array(Number(o.item_count)).fill(null),
    }));
    res.json(normalized);
  })
);

module.exports = router;
