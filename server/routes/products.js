const express = require("express");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");

const router = express.Router();

function finalPriceExpr() {
  return "ROUND(p.price * (1 - p.discount_percent / 100), 2)";
}

// GET /api/products?query=&category=&sort=&minPrice=&maxPrice=&inStockOnly=&page=&limit=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      query = "",
      category = "",
      sort = "relevance",
      minPrice,
      maxPrice,
      inStockOnly,
      page = 1,
      limit = 24,
    } = req.query;

    const where = [];
    const params = [];

    if (query) {
      where.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${query}%`, `%${query}%`);
    }
    if (category) {
      where.push("c.slug = ?");
      params.push(category);
    }
    if (inStockOnly === "true") {
      where.push("p.stock > 0");
    }
    if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
      where.push(`${finalPriceExpr()} >= ?`);
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
      where.push(`${finalPriceExpr()} <= ?`);
      params.push(Number(maxPrice));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sortMap = {
      "price-asc": `${finalPriceExpr()} ASC`,
      "price-desc": `${finalPriceExpr()} DESC`,
      rating: "p.rating DESC",
      newest: "p.created_at DESC",
      relevance: "p.units_sold DESC",
    };
    const orderSql = sortMap[sort] || sortMap.relevance;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.query(
      `SELECT p.product_id, p.name, p.sku, p.price, p.discount_percent, p.stock,
              p.image, p.rating, p.review_count, p.units_sold,
              c.category_id, c.name AS category_name, c.slug AS category_slug,
              s.seller_id, s.display_name AS seller_name
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN sellers s ON s.seller_id = p.seller_id
       ${whereSql}
       ORDER BY ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       ${whereSql}`,
      params
    );

    res.json({ products: rows, page: pageNum, limit: limitNum, total });
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              s.display_name AS seller_name, s.seller_city, s.seller_state
       FROM products p
       LEFT JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN sellers s ON s.seller_id = p.seller_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );
    if (!rows.length) throw new ApiError(404, "Product not found");
    res.json(rows[0]);
  })
);

// GET /api/products/:id/related
router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 4);
    const [[product]] = await pool.query(
      "SELECT category_id FROM products WHERE product_id = ?",
      [req.params.id]
    );
    if (!product) throw new ApiError(404, "Product not found");

    const [rows] = await pool.query(
      `SELECT product_id, name, price, discount_percent, image, rating
       FROM products
       WHERE category_id = ? AND product_id != ?
       ORDER BY units_sold DESC
       LIMIT ?`,
      [product.category_id, req.params.id, limit]
    );
    res.json(rows);
  })
);

// GET /api/products/:id/reviews  (also mounted at /api/reviews/:productId)
router.get(
  "/:id/reviews",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT review_id, review_score AS rating, review_comment_title AS title,
              review_comment_message AS comment, review_creation_date AS created_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY review_creation_date DESC
       LIMIT 50`,
      [req.params.id]
    );
    const [[{ average }]] = await pool.query(
      `SELECT ROUND(AVG(review_score), 2) AS average FROM product_reviews WHERE product_id = ?`,
      [req.params.id]
    );
    res.json({
      reviews: rows.map((r) => ({ ...r, customer_name: "Verified Buyer", verified_purchase: true })),
      average: average || 0,
    });
  })
);

module.exports = router;
