const express = require("express");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");

const router = express.Router();

// GET /api/orders/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [[order]] = await pool.query("SELECT * FROM orders WHERE order_id = ?", [req.params.id]);
    if (!order) throw new ApiError(404, "Order not found");

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    const [payments] = await pool.query("SELECT * FROM payments WHERE order_id = ?", [req.params.id]);
    const [[customer]] = await pool.query(
      "SELECT customer_city, customer_state FROM customers WHERE customer_id = ?",
      [order.customer_id]
    );

    res.json({ ...order, items, payments, customer });
  })
);

module.exports = router;
