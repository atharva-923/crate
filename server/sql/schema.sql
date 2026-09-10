-- ============================================================
-- Crate — MySQL schema (crate_db)
-- Derived from the Olist e-commerce dataset.
-- Run with:  mysql -u root -p < schema.sql
-- ============================================================

DROP DATABASE IF EXISTS crate_db;
CREATE DATABASE crate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crate_db;

-- ------------------------------------------------------------
-- categories  (from product_category_name_translation.csv)
-- ------------------------------------------------------------
CREATE TABLE categories (
  category_id       INT AUTO_INCREMENT PRIMARY KEY,
  name_pt           VARCHAR(100) NOT NULL,          -- original Olist name
  name              VARCHAR(100) NOT NULL,          -- English (Crate-facing)
  slug              VARCHAR(120) NOT NULL UNIQUE,
  image             VARCHAR(500) NOT NULL,          -- curated fallback image
  UNIQUE KEY uq_categories_name_pt (name_pt)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sellers  (from olist_sellers_dataset.csv)
-- ------------------------------------------------------------
CREATE TABLE sellers (
  seller_id         VARCHAR(32) PRIMARY KEY,
  seller_zip_prefix VARCHAR(10),
  seller_city       VARCHAR(100),
  seller_state      CHAR(2),
  -- Crate-facing fields not present in Olist; sensible defaults, documented in README.
  display_name      VARCHAR(150) NOT NULL,
  rating             DECIMAL(2,1) DEFAULT 4.5
) ENGINE=InnoDB;
CREATE INDEX idx_sellers_state ON sellers (seller_state);

-- ------------------------------------------------------------
-- customers  (from olist_customers_dataset.csv)
-- ------------------------------------------------------------
CREATE TABLE customers (
  customer_id         VARCHAR(32) PRIMARY KEY,
  customer_unique_id  VARCHAR(32) NOT NULL,
  customer_zip_prefix VARCHAR(10),
  customer_city       VARCHAR(100),
  customer_state      CHAR(2)
) ENGINE=InnoDB;
CREATE INDEX idx_customers_unique ON customers (customer_unique_id);
CREATE INDEX idx_customers_state ON customers (customer_state);

-- ------------------------------------------------------------
-- geolocation  (from olist_geolocation_dataset.csv)
-- Kept as a lookup table keyed by zip prefix (not 1 row per person).
-- ------------------------------------------------------------
CREATE TABLE geolocation (
  zip_code_prefix   VARCHAR(10) PRIMARY KEY,
  lat               DECIMAL(10,7),
  lng               DECIMAL(10,7),
  city              VARCHAR(100),
  state             CHAR(2)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- products  (from olist_products_dataset.csv, price/stock derived
-- from order_items at import time — see scripts/import.js)
-- ------------------------------------------------------------
CREATE TABLE products (
  product_id           VARCHAR(32) PRIMARY KEY,
  category_id          INT,
  seller_id             VARCHAR(32),
  name                  VARCHAR(200) NOT NULL,   -- synthesized Crate catalog name + model (Olist has no product name)
  sku                   VARCHAR(64) NOT NULL,
  price                 DECIMAL(10,2) NOT NULL DEFAULT 0,       -- avg of order_items.price for this product
  discount_percent      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  stock                 INT NOT NULL DEFAULT 0,                 -- synthetic: see README limitation note
  weight_g              INT,
  length_cm             INT,
  height_cm             INT,
  width_cm              INT,
  photos_qty            INT DEFAULT 0,
  image                 VARCHAR(500) NOT NULL,   -- category-level fallback (Olist has no real product images)
  description           TEXT,
  rating                DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count           INT NOT NULL DEFAULT 0,
  units_sold             INT NOT NULL DEFAULT 0,  -- COUNT(*) from order_items, used for "bestseller"/sort
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_seller ON products (seller_id);
CREATE INDEX idx_products_price ON products (price);
CREATE FULLTEXT INDEX idx_products_search ON products (name, description);

-- ------------------------------------------------------------
-- orders  (from olist_orders_dataset.csv)
-- ------------------------------------------------------------
CREATE TABLE orders (
  order_id                     VARCHAR(32) PRIMARY KEY,
  customer_id                  VARCHAR(32) NOT NULL,
  order_status                 VARCHAR(20) NOT NULL,
  order_purchase_timestamp     DATETIME,
  order_approved_at            DATETIME,
  order_delivered_carrier_date DATETIME,
  order_delivered_customer_date DATETIME,
  order_estimated_delivery_date DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (order_status);
CREATE INDEX idx_orders_purchase_ts ON orders (order_purchase_timestamp);

-- ------------------------------------------------------------
-- order_items  (from olist_order_items_dataset.csv)
-- ------------------------------------------------------------
CREATE TABLE order_items (
  order_id            VARCHAR(32) NOT NULL,
  order_item_id        INT NOT NULL,
  product_id           VARCHAR(32) NOT NULL,
  seller_id             VARCHAR(32) NOT NULL,
  shipping_limit_date   DATETIME,
  price                 DECIMAL(10,2) NOT NULL,
  freight_value         DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_id, order_item_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_order_items_seller ON order_items (seller_id);

-- ------------------------------------------------------------
-- payments  (from olist_order_payments_dataset.csv)
-- ------------------------------------------------------------
CREATE TABLE payments (
  payment_id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id               VARCHAR(32) NOT NULL,
  payment_sequential     INT NOT NULL,
  payment_type           VARCHAR(20) NOT NULL,
  payment_installments    INT NOT NULL DEFAULT 1,
  payment_value           DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  UNIQUE KEY uq_payment (order_id, payment_sequential)
) ENGINE=InnoDB;
CREATE INDEX idx_payments_type ON payments (payment_type);

-- ------------------------------------------------------------
-- reviews  (from olist_order_reviews_dataset.csv)
-- Olist reviews are per-ORDER, not per-product. We keep the
-- relationship honest (review -> order) and expose a derived
-- product-review view for the product page (see below).
-- ------------------------------------------------------------
CREATE TABLE reviews (
  review_id               VARCHAR(32) PRIMARY KEY,
  order_id                 VARCHAR(32) NOT NULL,
  review_score              TINYINT UNSIGNED NOT NULL,
  review_comment_title       VARCHAR(255),
  review_comment_message      TEXT,
  review_creation_date         DATETIME,
  review_answer_timestamp      DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_reviews_score ON reviews (review_score);

-- ------------------------------------------------------------
-- View: product reviews, derived through order_items -> orders -> reviews
-- (an order can contain several products, so this is a best-effort join,
--  documented in README as an Olist data-shape limitation)
-- ------------------------------------------------------------
CREATE VIEW product_reviews AS
SELECT oi.product_id, r.review_id, r.review_score, r.review_comment_title,
       r.review_comment_message, r.review_creation_date
FROM order_items oi
JOIN reviews r ON r.order_id = oi.order_id;

-- ------------------------------------------------------------
-- View: seller performance (used by seller dashboard)
-- ------------------------------------------------------------
CREATE VIEW seller_performance AS
SELECT s.seller_id, s.display_name,
       COUNT(DISTINCT oi.order_id)      AS orders_count,
       COUNT(oi.product_id)             AS items_sold,
       ROUND(SUM(oi.price), 2)          AS revenue
FROM sellers s
LEFT JOIN order_items oi ON oi.seller_id = s.seller_id
GROUP BY s.seller_id, s.display_name;
