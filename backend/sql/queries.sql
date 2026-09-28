-- ============================================================
-- Crate — demonstration SQL queries (crate_db)
-- Grouped to match a typical DBMS course rubric.
-- ============================================================
USE crate_db;

-- ---------- 1. BASIC: SELECT / WHERE / ORDER BY / LIMIT ----------
SELECT name, price, rating FROM products
WHERE price < 100
ORDER BY rating DESC
LIMIT 10;

-- ---------- 2. FILTERING: LIKE / BETWEEN / IN ----------
SELECT name, price FROM products WHERE name LIKE '%Beauty%';

SELECT name, price FROM products WHERE price BETWEEN 50 AND 150;

SELECT o.order_id, o.order_status FROM orders o
WHERE o.order_status IN ('delivered', 'shipped');

-- ---------- 3. AGGREGATION: COUNT / SUM / AVG / MIN / MAX ----------
SELECT COUNT(*) AS total_products FROM products;
SELECT SUM(price) AS total_catalog_value FROM products;
SELECT AVG(rating) AS avg_rating FROM products;
SELECT MIN(price) AS cheapest, MAX(price) AS priciest FROM products;

-- ---------- 4. GROUPING: GROUP BY / HAVING ----------
-- Sales/revenue grouped by category
SELECT c.name AS category, COUNT(oi.product_id) AS items_sold,
       ROUND(SUM(oi.price), 2) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
JOIN categories c ON c.category_id = p.category_id
GROUP BY c.name
HAVING revenue > 1000
ORDER BY revenue DESC;

-- ---------- 5. JOINS: INNER JOIN / LEFT JOIN ----------
-- Products with their category and seller (INNER JOIN)
SELECT p.name, c.name AS category, s.display_name AS seller
FROM products p
INNER JOIN categories c ON c.category_id = p.category_id
INNER JOIN sellers s ON s.seller_id = p.seller_id
LIMIT 20;

-- Every product, including ones with no recorded reviews (LEFT JOIN)
SELECT p.name, COUNT(pr.review_id) AS review_count
FROM products p
LEFT JOIN product_reviews pr ON pr.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY review_count DESC;

-- ---------- 6. Top-selling products ----------
SELECT p.product_id, p.name, COUNT(oi.order_id) AS times_ordered
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name
ORDER BY times_ordered DESC
LIMIT 10;

-- ---------- 7. Revenue by product ----------
SELECT p.product_id, p.name, ROUND(SUM(oi.price), 2) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name
ORDER BY revenue DESC
LIMIT 10;

-- ---------- 8. Revenue by seller ----------
SELECT * FROM seller_performance ORDER BY revenue DESC LIMIT 10;

-- ---------- 9. Orders by customer ----------
SELECT o.order_id, o.order_status, o.order_purchase_timestamp
FROM orders o
WHERE o.customer_id = ?   -- bind a real customer_id
ORDER BY o.order_purchase_timestamp DESC;

-- ---------- 10. Average review score per product ----------
SELECT p.product_id, p.name, ROUND(AVG(pr.review_score), 2) AS avg_score
FROM products p
JOIN product_reviews pr ON pr.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY avg_score DESC
LIMIT 10;

-- ---------- 11. Most-reviewed products ----------
SELECT p.product_id, p.name, COUNT(pr.review_id) AS review_count
FROM products p
JOIN product_reviews pr ON pr.product_id = p.product_id
GROUP BY p.product_id, p.name
ORDER BY review_count DESC
LIMIT 10;

-- ---------- 12. Payment method statistics ----------
SELECT payment_type, COUNT(*) AS uses, ROUND(SUM(payment_value), 2) AS total_value
FROM payments
GROUP BY payment_type
ORDER BY total_value DESC;

-- ---------- 13. Order status statistics ----------
SELECT order_status, COUNT(*) AS orders
FROM orders
GROUP BY order_status
ORDER BY orders DESC;

-- ---------- 14. Monthly sales ----------
SELECT DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m') AS month,
       ROUND(SUM(oi.price), 2) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY month
ORDER BY month;

-- ---------- 15. Subquery: products priced above the category average ----------
SELECT p.name, p.price, p.category_id
FROM products p
WHERE p.price > (
  SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p.category_id
);

-- ---------- 16. Transaction example: place an order atomically ----------
-- START TRANSACTION;
--   INSERT INTO orders (order_id, customer_id, order_status, order_purchase_timestamp)
--     VALUES (?, ?, 'created', NOW());
--   INSERT INTO order_items (order_id, order_item_id, product_id, seller_id, price, freight_value)
--     VALUES (?, 1, ?, ?, ?, ?);
--   UPDATE products SET stock = stock - 1 WHERE product_id = ? AND stock > 0;
-- COMMIT;

-- ---------- 17. Trigger example: keep products.units_sold in sync ----------
DELIMITER $$
CREATE TRIGGER trg_order_items_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE products SET units_sold = units_sold + 1 WHERE product_id = NEW.product_id;
END$$
DELIMITER ;

-- ---------- 18. Stored procedure example: top N products in a category ----------
DELIMITER $$
CREATE PROCEDURE top_products_in_category(IN cat_id INT, IN n INT)
BEGIN
  SELECT product_id, name, price, rating
  FROM products
  WHERE category_id = cat_id
  ORDER BY units_sold DESC
  LIMIT n;
END$$
DELIMITER ;
-- CALL top_products_in_category(1, 5);
