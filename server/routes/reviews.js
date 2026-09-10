const express = require("express");
const pool = require("../db");
const { asyncHandler } = require("../utils");

const router = express.Router();

// GET /api/reviews/:productId
router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT review_id, review_score AS rating, review_comment_title AS title,
              review_comment_message AS comment, review_creation_date AS created_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY review_creation_date DESC
       LIMIT 50`,
      [req.params.productId]
    );
    const [[{ average }]] = await pool.query(
      `SELECT ROUND(AVG(review_score), 2) AS average FROM product_reviews WHERE product_id = ?`,
      [req.params.productId]
    );
    res.json({
      reviews: rows.map((r) => ({ ...r, customer_name: "Verified Buyer", verified_purchase: true })),
      average: average || 0,
    });
  })
);

// POST /api/reviews/:productId
// Olist reviews are tied to real orders, so we can't legitimately attach a
// new review to a product without an order_id. This endpoint is left as a
// documented stub — wire it up once your checkout flow creates real orders.
router.post("/:productId", (req, res) => {
  res.status(501).json({
    error:
      "Submitting new reviews requires an associated order_id and isn't wired up yet — see server/routes/reviews.js",
  });
});

module.exports = router;
