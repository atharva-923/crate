const pool = require("../db");

async function main() {
  console.log("=== Testing ADBMS Syllabus Queries ===\n");

  // 1. Window Function: DENSE_RANK
  console.log("1. Testing Window Function (DENSE_RANK across Categories):");
  const [q1] = await pool.query(`
    SELECT c.name AS category, p.name AS product, p.price,
           DENSE_RANK() OVER (PARTITION BY c.name ORDER BY p.price DESC) AS price_rank
    FROM products p
    JOIN categories c ON c.category_id = p.category_id
    WHERE c.slug IN ('audio', 'art', 'air-conditioning')
    LIMIT 6
  `);
  console.table(q1);

  // 2. Value Function: LAG() (Month-over-month sales)
  console.log("\n2. Testing Value Function (LAG month-over-month growth):");
  const [q2] = await pool.query(`
    WITH MonthlySales AS (
      SELECT DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m') AS sale_month,
             ROUND(SUM(oi.price), 2) AS revenue
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.order_id
      GROUP BY DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m')
    )
    SELECT sale_month, revenue,
           LAG(revenue, 1) OVER (ORDER BY sale_month) AS prev_month_revenue,
           ROUND((revenue - LAG(revenue, 1) OVER (ORDER BY sale_month)) / LAG(revenue, 1) OVER (ORDER BY sale_month) * 100, 1) AS growth_pct
    FROM MonthlySales
    ORDER BY sale_month
    LIMIT 5
  `);
  console.table(q2);

  // 3. CTE + Running Total
  console.log("\n3. Testing Aggregate Window Function (Running Cumulative Total):");
  const [q3] = await pool.query(`
    SELECT o.order_id, DATE(o.order_purchase_timestamp) AS order_date, oi.price,
           SUM(oi.price) OVER (ORDER BY o.order_purchase_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    LIMIT 5
  `);
  console.table(q3);

  // 4. Advanced Grouping: WITH ROLLUP
  console.log("\n4. Testing Advanced Grouping (WITH ROLLUP):");
  const [q4] = await pool.query(`
    SELECT COALESCE(s.seller_state, 'ALL STATES') AS state,
           COUNT(DISTINCT oi.order_id) AS orders_count,
           ROUND(SUM(oi.price), 2) AS total_revenue
    FROM sellers s
    JOIN order_items oi ON oi.seller_id = s.seller_id
    GROUP BY s.seller_state WITH ROLLUP
    LIMIT 6
  `);
  console.table(q4);

  console.log("\n✓ ALL ADBMS QUERIES EXECUTED SUCCESSFULLY!\n");
  await pool.end();
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
