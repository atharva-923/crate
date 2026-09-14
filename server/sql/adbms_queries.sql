-- ==============================================================================
-- ADVANCED DATABASE MANAGEMENT SYSTEMS (ADBMS) — DEMONSTRATION SUITE
-- Institution: St. John College of Engineering and Management (Autonomous)
-- Affiliated to: University of Mumbai / MSBTE
-- Database: crate_db (MySQL 8.0+)
-- ==============================================================================

USE crate_db;

-- ##############################################################################
-- MODULE II: ADVANCED SQL TECHNIQUES FOR REAL-WORLD DATA ANALYSIS
-- ##############################################################################

-- ------------------------------------------------------------------------------
-- 1. WINDOW FUNCTIONS: RANKING FUNCTIONS
-- Concepts: ROW_NUMBER(), RANK(), DENSE_RANK() with PARTITION BY and ORDER BY
-- Objective: Rank top-selling products within each department by revenue.
-- ------------------------------------------------------------------------------

WITH CategoryProductRevenue AS (
  SELECT 
    c.name AS category_name,
    p.name AS product_name,
    p.price,
    SUM(oi.price * (1 - p.discount_percent / 100)) AS total_revenue,
    COUNT(oi.order_id) AS total_orders
  FROM products p
  JOIN categories c ON c.category_id = p.category_id
  JOIN order_items oi ON oi.product_id = p.product_id
  GROUP BY c.name, p.product_id, p.name, p.price
)
SELECT 
  category_name,
  product_name,
  price,
  ROUND(total_revenue, 2) AS total_revenue,
  ROW_NUMBER() OVER (PARTITION BY category_name ORDER BY total_revenue DESC) AS row_num,
  RANK()       OVER (PARTITION BY category_name ORDER BY total_revenue DESC) AS rank_pos,
  DENSE_RANK() OVER (PARTITION BY category_name ORDER BY total_revenue DESC) AS dense_rank_pos
FROM CategoryProductRevenue;


-- ------------------------------------------------------------------------------
-- 2. WINDOW FUNCTIONS: VALUE FUNCTIONS (TIME-BASED COMPARISON)
-- Concepts: LAG(), LEAD()
-- Objective: Analyze month-over-month revenue growth and calculate percentage change.
-- ------------------------------------------------------------------------------

WITH MonthlySales AS (
  SELECT 
    DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m') AS sale_month,
    ROUND(SUM(oi.price), 2) AS current_month_revenue,
    COUNT(DISTINCT o.order_id) AS total_orders
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.order_status = 'delivered'
  GROUP BY DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m')
)
SELECT 
  sale_month,
  current_month_revenue,
  LAG(current_month_revenue, 1) OVER (ORDER BY sale_month) AS prev_month_revenue,
  LEAD(current_month_revenue, 1) OVER (ORDER BY sale_month) AS next_month_revenue,
  ROUND(
    (current_month_revenue - LAG(current_month_revenue, 1) OVER (ORDER BY sale_month)) 
    / LAG(current_month_revenue, 1) OVER (ORDER BY sale_month) * 100, 2
  ) AS mom_growth_percent
FROM MonthlySales
ORDER BY sale_month;


-- ------------------------------------------------------------------------------
-- 3. AGGREGATE WINDOW FUNCTIONS: RUNNING TOTALS & CUMULATIVE ANALYSIS
-- Concepts: SUM() OVER (PARTITION BY ... ORDER BY ...), AVG() OVER (...)
-- Objective: Compute running cumulative revenue and moving averages over time.
-- ------------------------------------------------------------------------------

SELECT 
  DATE(o.order_purchase_timestamp) AS order_date,
  o.order_id,
  c.name AS category_name,
  oi.price AS item_price,
  -- Cumulative running total within each category
  SUM(oi.price) OVER (
    PARTITION BY c.category_id 
    ORDER BY o.order_purchase_timestamp 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS category_running_revenue,
  -- 7-item moving average price within the category
  ROUND(AVG(oi.price) OVER (
    PARTITION BY c.category_id 
    ORDER BY o.order_purchase_timestamp 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ), 2) AS moving_avg_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
JOIN categories c ON c.category_id = p.category_id
WHERE o.order_status = 'delivered'
LIMIT 50;


-- ------------------------------------------------------------------------------
-- 4. CONDITIONAL LOGIC & TRANSFORMATION
-- Concepts: CASE WHEN, COALESCE()
-- Objective: Dynamic customer segmentation and stock health monitoring.
-- ------------------------------------------------------------------------------

SELECT 
  p.product_id,
  p.name AS product_name,
  p.price,
  p.stock,
  -- Inventory alert categorization
  CASE 
    WHEN p.stock = 0 THEN 'OUT OF STOCK'
    WHEN p.stock <= 15 THEN 'LOW STOCK (REORDER)'
    WHEN p.stock BETWEEN 16 AND 50 THEN 'OPTIMAL INVENTORY'
    ELSE 'OVERSTOCKED'
  END AS inventory_status,
  -- Price tier classification
  CASE 
    WHEN p.price < 2000 THEN 'Budget Tier'
    WHEN p.price BETWEEN 2000 AND 15000 THEN 'Mid-Range'
    ELSE 'Premium / Luxury'
  END AS pricing_tier,
  -- COALESCE fallback for handling NULL descriptions or discount values
  COALESCE(p.discount_percent, 0) AS safe_discount,
  COALESCE(p.description, 'No detailed description provided.') AS safe_description
FROM products p
ORDER BY p.stock ASC
LIMIT 30;


-- ------------------------------------------------------------------------------
-- 5. ADVANCED AGGREGATION & ROLLUP
-- Concepts: GROUP_CONCAT(), WITH ROLLUP
-- Objective: Generate multi-level regional sales breakdown and concatenated catalog lines.
-- ------------------------------------------------------------------------------

-- 5A. Multi-level hierarchical sales summary (State -> City -> Total)
SELECT 
  COALESCE(s.seller_state, 'ALL STATES') AS state,
  COALESCE(s.seller_city, 'ALL CITIES') AS city,
  COUNT(DISTINCT oi.order_id) AS total_orders,
  ROUND(SUM(oi.price), 2) AS total_revenue
FROM sellers s
JOIN order_items oi ON oi.seller_id = s.seller_id
GROUP BY s.seller_state, s.seller_city WITH ROLLUP;

-- 5B. String Aggregation: Top brands / products per seller
SELECT 
  s.display_name AS seller_name,
  s.seller_city,
  COUNT(p.product_id) AS total_products_listed,
  GROUP_CONCAT(DISTINCT SUBSTRING_INDEX(p.name, ' ', 3) ORDER BY p.price DESC SEPARATOR ' | ') AS top_product_lines
FROM sellers s
JOIN products p ON p.seller_id = s.seller_id
GROUP BY s.seller_id, s.display_name, s.seller_city
LIMIT 15;


-- ------------------------------------------------------------------------------
-- 6. DATA RESHAPING FOR REPORTING (PIVOT / CROSS-TABULATION)
-- Concepts: PIVOT using Conditional Aggregation (CASE WHEN inside SUM)
-- Objective: Compare revenue across top departments across quarters.
-- ------------------------------------------------------------------------------

SELECT 
  c.name AS category,
  ROUND(SUM(CASE WHEN QUARTER(o.order_purchase_timestamp) = 1 THEN oi.price ELSE 0 END), 2) AS Q1_Revenue,
  ROUND(SUM(CASE WHEN QUARTER(o.order_purchase_timestamp) = 2 THEN oi.price ELSE 0 END), 2) AS Q2_Revenue,
  ROUND(SUM(CASE WHEN QUARTER(o.order_purchase_timestamp) = 3 THEN oi.price ELSE 0 END), 2) AS Q3_Revenue,
  ROUND(SUM(CASE WHEN QUARTER(o.order_purchase_timestamp) = 4 THEN oi.price ELSE 0 END), 2) AS Q4_Revenue,
  ROUND(SUM(oi.price), 2) AS Annual_Total
FROM categories c
JOIN products p ON p.category_id = c.category_id
JOIN order_items oi ON oi.product_id = p.product_id
JOIN orders o ON o.order_id = oi.order_id
GROUP BY c.name
ORDER BY Annual_Total DESC;


-- ------------------------------------------------------------------------------
-- 7. COMMON TABLE EXPRESSIONS (CTEs)
-- Concepts: Multiple CTEs (WITH clause), Recursive CTE
-- Objective: Calculate Customer Lifetime Value (CLV) and hierarchical classification.
-- ------------------------------------------------------------------------------

-- 7A. Multi-Step Analytics CTE
WITH CustomerSpend AS (
  SELECT 
    c.customer_id,
    c.customer_name,
    c.customer_city,
    COUNT(DISTINCT o.order_id) AS order_count,
    ROUND(SUM(oi.price), 2) AS total_spent
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY c.customer_id, c.customer_name, c.customer_city
),
CustomerTiers AS (
  SELECT 
    customer_id,
    customer_name,
    customer_city,
    order_count,
    total_spent,
    NTILE(4) OVER (ORDER BY total_spent DESC) AS spend_quartile
  FROM CustomerSpend
)
SELECT 
  customer_name,
  customer_city,
  order_count,
  total_spent,
  CASE spend_quartile
    WHEN 1 THEN 'Platinum VIP (Top 25%)'
    WHEN 2 THEN 'Gold Member (Upper 50%)'
    WHEN 3 THEN 'Silver Member'
    ELSE 'Bronze / Occasional Shopper'
  END AS customer_tier
FROM CustomerTiers
ORDER BY total_spent DESC
LIMIT 20;

-- 7B. Recursive CTE: Generating a sequence of future promotional campaign dates
WITH RECURSIVE PromoSchedule AS (
  SELECT 1 AS campaign_id, DATE('2024-01-01') AS promo_start_date, DATE('2024-01-07') AS promo_end_date
  UNION ALL
  SELECT campaign_id + 1, DATE_ADD(promo_start_date, INTERVAL 14 DAY), DATE_ADD(promo_end_date, INTERVAL 14 DAY)
  FROM PromoSchedule
  WHERE campaign_id < 8
)
SELECT * FROM PromoSchedule;


-- ##############################################################################
-- MODULE III: DATABASE DESIGN, INDEXING & QUERY OPTIMIZATION
-- ##############################################################################

-- ------------------------------------------------------------------------------
-- 8. QUERY EXECUTION PLAN (EXPLAIN) & B-TREE INDEXING
-- Concepts: Query Cost, B-Tree Indexes, Index Scan vs Table Scan
-- ------------------------------------------------------------------------------

-- Demonstrating EXPLAIN on an unindexed vs indexed query pattern
EXPLAIN
SELECT p.name, p.price, c.name AS category
FROM products p
JOIN categories c ON c.category_id = p.category_id
WHERE p.category_id = 1 AND p.price BETWEEN 5000 AND 30000;

-- Query Execution Plan with JSON format (shows Query Cost & Filter Efficiency)
EXPLAIN FORMAT=JSON
SELECT o.order_id, o.order_status, SUM(oi.price) AS order_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.order_purchase_timestamp >= '2023-06-01'
GROUP BY o.order_id, o.order_status;
