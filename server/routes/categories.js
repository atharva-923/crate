const express = require("express");
const pool = require("../db");
const { asyncHandler } = require("../utils");

const router = express.Router();

// GET /api/categories
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT c.category_id, c.name, c.slug, c.image,
              COUNT(p.product_id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.category_id
       GROUP BY c.category_id, c.name, c.slug, c.image
       ORDER BY c.name`
    );
    res.json(rows);
  })
);

module.exports = router;
