const express = require("express");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");

const router = express.Router();

// GET /api/sellers/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT s.*,
              ROUND(AVG(p.rating), 2) AS product_avg_rating,
              COALESCE(SUM(p.review_count), 0) AS review_count
       FROM sellers s
       LEFT JOIN products p ON p.seller_id = s.seller_id
       WHERE s.seller_id = ?
       GROUP BY s.seller_id`,
      [req.params.id]
    );
    if (!rows.length) throw new ApiError(404, "Seller not found");
    res.json(rows[0]);
  })
);

// GET /api/sellers/:id/products
router.get(
  "/:id/products",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT product_id, name, price, discount_percent, stock, image, rating, units_sold
       FROM products WHERE seller_id = ? ORDER BY units_sold DESC`,
      [req.params.id]
    );
    res.json(rows);
  })
);

// GET /api/sellers/:id/orders
router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT o.order_id, o.order_status, o.order_purchase_timestamp,
              ROUND(SUM(oi.price + oi.freight_value), 2) AS seller_total
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.order_id
       WHERE oi.seller_id = ?
       GROUP BY o.order_id, o.order_status, o.order_purchase_timestamp
       ORDER BY o.order_purchase_timestamp DESC
       LIMIT 100`,
      [req.params.id]
    );
    res.json(rows);
  })
);

// GET /api/sellers/:id/customers
router.get(
  "/:id/customers",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT c.customer_id, COUNT(DISTINCT o.order_id) AS orders,
              ROUND(SUM(oi.price + oi.freight_value), 2) AS spend
       FROM order_items oi
       JOIN orders o ON o.order_id = oi.order_id
       JOIN customers c ON c.customer_id = o.customer_id
       WHERE oi.seller_id = ?
       GROUP BY c.customer_id
       ORDER BY spend DESC
       LIMIT 100`,
      [req.params.id]
    );
    res.json(rows);
  })
);

// GET /api/sellers/:id/stats
router.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    const [[perf]] = await pool.query(
      "SELECT * FROM seller_performance WHERE seller_id = ?",
      [req.params.id]
    );
    const [[stock]] = await pool.query(
      `SELECT
         COUNT(*) AS totalProducts,
         SUM(CASE WHEN stock > 0 AND stock <= 10 THEN 1 ELSE 0 END) AS lowStock,
         SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS outOfStock,
         ROUND(AVG(rating), 2) AS avgRating
       FROM products WHERE seller_id = ?`,
      [req.params.id]
    );
    res.json({
      totalProducts: stock.totalProducts || 0,
      totalOrders: perf?.orders_count || 0,
      revenue: perf?.revenue || 0,
      lowStock: stock.lowStock || 0,
      outOfStock: stock.outOfStock || 0,
      avgRating: stock.avgRating || 0,
    });
  })
);

module.exports = router;
