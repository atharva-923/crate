const express = require("express");
const pool = require("../db");
const { asyncHandler } = require("../utils");

const router = express.Router();

// GET /api/customers/:id/orders
router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT order_id, order_status, order_purchase_timestamp, order_estimated_delivery_date
       FROM orders WHERE customer_id = ? ORDER BY order_purchase_timestamp DESC`,
      [req.params.id]
    );
    res.json(rows);
  })
);

module.exports = router;
