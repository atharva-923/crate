const express = require("express");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");
const { authCustomer } = require("../middleware/auth");

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
router.post(
  "/:productId",
  authCustomer,
  asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, "Valid rating (1-5) is required");

    // Verify the customer has actually purchased and received this product
    const [[purchase]] = await pool.query(
      `SELECT o.order_id
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.order_id
       WHERE o.customer_id = ? AND oi.product_id = ? AND o.order_status = 'delivered'
       LIMIT 1`,
      [req.customer.customer_id, req.params.productId]
    );

    if (!purchase) {
      throw new ApiError(403, "You can only review products you have purchased and received.");
    }

    const review_id = `rev_${Date.now()}`;
    await pool.query(
      `INSERT INTO reviews (review_id, order_id, review_score, review_comment_title, review_comment_message, review_creation_date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [review_id, purchase.order_id, rating, title || "", comment || ""]
    );

    res.json({ success: true, message: "Review submitted successfully" });
  })
);

module.exports = router;
