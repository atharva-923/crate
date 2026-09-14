# Crate — E-commerce Marketplace & ADBMS Demo

Crate is a **Next.js 14 (App Router)** e-commerce marketplace frontend, backed by a real **Node.js/Express + MySQL** API. The database is populated by a custom-built 3NF relational dataset generator powered by real Amazon product data.

```
Next.js 14 Frontend  →  HTTP/JSON  →  Node.js + Express  →  SQL  →  MySQL (crate_db)
```

This project serves as a comprehensive demonstration of Advanced Database Management Systems (ADBMS) concepts, including Window Functions, CTEs, Rollups, and complex joins, all running against a realistic e-commerce schema.

## Project layout

```
crate/
  src/                    Next.js frontend (UI, real API calls)
  server/                 Express + MySQL backend
    sql/schema.sql         Relational schema for crate_db (3NF)
    sql/adbms_queries.sql  Advanced SQL queries demonstrating syllabus concepts
    scripts/               Generates and seeds the database
    routes/                REST endpoints (products, categories, sellers, orders, etc.)
    db.js, server.js       Database connection and Express server setup
```

## Dataset & Seeding

The backend relies on a purely relational (3NF) database that is synthetically generated using real product titles and CDN images from the **Amazon India** public dataset. 

> 📦 **Dataset Generation:** Instead of using messy, incomplete real-world transaction logs, we use `scripts/generate-relational-dataset.js` to harvest authentic products from a raw Amazon CSV and surround them with perfectly normalized customers, sellers, temporal orders, and reviews.

### 1. Set up MySQL Schema

```bash
mysql -u root -p < server/sql/schema.sql
```
This creates the `crate_db` database, tables, indexes, and views.

### 2. Generate and Seed the Data

1. `cd server && cp .env.example .env` and fill in your MySQL credentials.
2. `npm install`
3. Download the [Amazon India Products CSV](https://www.kaggle.com/datasets/asaniczka/amazon-india-products-2023-1-5m-products) and place it at `server/csv-data/amazon_products.csv`.
4. Generate the relational CSVs:
   ```bash
   npm run generate:dataset
   ```
5. Seed the MySQL database:
   ```bash
   npm run seed:custom
   ```

## Running the Application

**Run the backend:**
```bash
cd server
npm run dev     # Starts Express API on http://localhost:4000
```

**Run the frontend:**
```bash
# From the crate/ root directory
npm install
cp .env.local.example .env.local   
npm run dev     # Starts Next.js on http://localhost:3000
```

## ADBMS Features Demonstrated

The `server/sql/adbms_queries.sql` file contains a suite of advanced queries tailored for a database management syllabus:
- **Window Functions**: `DENSE_RANK()`, `ROW_NUMBER()` for Top-N per category.
- **Value Functions**: `LAG()`, `LEAD()` for month-over-month revenue analysis.
- **Aggregate Window Functions**: Moving averages and running cumulative totals.
- **Advanced Grouping**: `WITH ROLLUP` for hierarchical regional sales.
- **Common Table Expressions (CTEs)**: Recursive CTEs and multi-step data pipelines for Customer Lifetime Value (CLV).

Run the test script to verify all queries against the seeded database:
```bash
cd server
npm run test:adbms
```

## Demo Data Notes

- **Auth is mocked**: Any email + 6+ character password logs you into a demo customer or seller account (`/login`, `/seller/login`).
- Checkout creates a local, in-memory order object (transactional insertion into MySQL is mapped out in SQL but left mocked in the JS layer for safety).
