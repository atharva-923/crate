# Crate — E-commerce Marketplace

Crate is a **Next.js 14 (App Router)** e-commerce marketplace frontend, now backed by a
real **Node.js/Express + MySQL** API populated from the [Olist Brazilian e-commerce
dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce).

```
Next.js 14 Frontend  →  HTTP/JSON  →  Node.js + Express  →  SQL  →  MySQL (crate_db)
```

The UI itself — layout, navigation, colors, product cards, cart, checkout, seller
dashboard — is unchanged from the original mock-data build. Only the data layer
(`src/services/api/*`) and the handful of components that imported mock arrays directly
were touched.

## Project layout

```
crate/
  src/                    Next.js frontend (unchanged UI, real API calls)
    services/api/         talks to the Express backend (see below)
    data/                 only what's still legitimately static (auth demo users, status labels)
  server/                 Express + MySQL backend (new)
    sql/schema.sql         relational schema for crate_db
    sql/queries.sql         demo SQL — joins, aggregation, subquery, transaction, trigger, procedure
    scripts/import.js       loads the Olist CSVs into MySQL
    routes/                 REST endpoints (products, categories, sellers, orders, customers, reviews)
    db.js, server.js, utils.js
```

## 1. Set up MySQL

```bash
mysql -u root -p < server/sql/schema.sql
```

This creates the `crate_db` database and all tables/indexes/views described below.

## 2. Import the Olist dataset

1. Extract the Olist CSV zip so the 9 CSVs sit in `server/csv-data/` (or point `CSV_DIR`
   in `.env` somewhere else).
2. `cd server && cp .env.example .env` and fill in your MySQL credentials.
3. `npm install`
4. `npm run import`

The import script (`server/scripts/import.js`) loads categories → sellers → customers →
geolocation → products → orders → order_items → payments → reviews, then runs a few
aggregation queries to fill in fields the Olist dataset doesn't have directly (see
**Data limitations** below).

## 3. Run the backend

```bash
cd server
npm run start        # http://localhost:4000
# or: npm run dev     # auto-restart on change
```

## 4. Run the frontend

```bash
npm install           # from the crate/ root
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if not localhost:4000
npm run dev            # http://localhost:3000
```

## API endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | `?query=&category=&sort=&minPrice=&maxPrice=&inStockOnly=&page=&limit=` |
| GET | `/api/products/:id` | single product, joined with category + seller |
| GET | `/api/products/:id/related` | same-category products |
| GET | `/api/reviews/:productId` | reviews, derived through order_items → orders → reviews |
| GET | `/api/categories` | includes live product counts |
| GET | `/api/sellers/:id` | profile + aggregated rating/review count |
| GET | `/api/sellers/:id/products` \| `/orders` \| `/customers` \| `/stats` | seller dashboard data |
| GET | `/api/orders/:id` | order + items + payments + customer city/state |
| GET | `/api/customers/:id/orders` | a customer's order history |
| GET | `/api/health` | liveness check |

All queries are parameterized (`?` placeholders via `mysql2`) — nothing is built with
string concatenation.

## Data limitations (documented, not hidden)

The Olist dataset is a real **operational** dataset, not a product-catalog export, so a
few Crate-facing fields don't exist in it and had to be filled in deliberately rather
than invented at random:

- **Product name** — Olist has no product name field, only a category. Names are
  synthesized as `"{Category} — Item {short id}"`.
- **Product images** — Olist has no images. Each of the 73 categories maps to one
  curated, fixed Unsplash photo (same approach the original mock catalog used), with a
  generic fallback for unmapped categories. No random/external product-image API is used.
- **Price** — Olist has no catalog price; it only records what each unit actually sold
  for in `order_items`. A product's listed price is the **average of its order_items
  prices**.
- **Stock** — Olist has no inventory concept at all. Stock is a seeded pseudo-random
  value per `product_id` (5–80 units), stable across re-imports, purely so the
  in-stock/low-stock/out-of-stock UI has something to render. This is the one field that
  is genuinely synthetic rather than derived, and is called out here rather than
  presented as real.
- **Discount %** — likewise not in Olist; seeded per product for UI variety (0/10/15/20%).
- **Reviews are per-order, not per-product** in Olist. `product_reviews` is a SQL view
  that joins `order_items → reviews`, so a product's reviews are "reviews of orders that
  contained this product" — documented in `schema.sql`.
- **Seller per product** — Olist links sellers to *order_items*, not to products
  directly (a product can theoretically ship from more than one seller). Each product is
  assigned the seller who sold it most often, computed with a window function during
  import.

## Not yet wired up

- **Checkout doesn't write to MySQL.** `orderService.placeOrder()` still returns a
  local, in-memory order object (see the comment in that file). Wiring it up means
  inserting into `orders` / `order_items` / `payments` inside a transaction — the SQL
  pattern is sketched in `server/sql/queries.sql` §16.
- **New reviews can't be submitted** for the same reason: a real review needs a real
  `order_id` to attach to. `POST /api/reviews/:productId` returns `501 Not Implemented`
  with an explanation.
- **Auth stays mocked**, per the original design — `src/services/api/authService.js` is
  untouched. No real backend authentication was added, since Olist has no customer
  credentials to authenticate against.

## Demo data notes

- Auth is mocked: any email + 6+ character password logs you into a demo customer or
  seller account (`/login`, `/seller/login`).
- To browse a real seller dashboard, log in with the seller demo flow, then substitute a
  real `seller_id` from your imported `sellers` table (e.g. via `SELECT seller_id FROM
  sellers LIMIT 1;`) — the demo seller login doesn't map to a specific imported seller.
- For `/orders/:id`, use a real `order_id` from your imported `orders` table.
