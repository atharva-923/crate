/**
 * Imports the Olist CSV dataset into crate_db.
 *
 * Usage:
 *   1. mysql -u root -p < sql/schema.sql
 *   2. Extract the Olist zip into server/csv-data/ (or set CSV_DIR in .env)
 *   3. npm run import
 *
 * Order matters because of foreign keys:
 *   categories -> sellers -> customers -> geolocation -> products
 *   -> orders -> order_items -> payments -> reviews
 *   -> post-import aggregation (price, units_sold, rating, seller_id)
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const pool = require("../db");

const CSV_DIR = process.env.CSV_DIR || path.join(__dirname, "..", "csv-data");

function readCsv(filename) {
  const file = path.join(CSV_DIR, filename);
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

// Curated, license-free fallback images. Olist has no product images, so we
// map each category to a representative photo — same approach the existing
// mock catalog already used (Unsplash), just keyed by category instead of
// hand-picked per product. This satisfies "controlled fallback image" (spec §5).
const CATEGORY_IMAGES = [
  { match: /bed|bath|table|furniture|decor|garden|christmas/i, url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=700&q=80" },
  { match: /electronic|computer|phone|audio|tablet|pc_/i, url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80" },
  { match: /fashion|clothes|shoe|bag|watch|underwear/i, url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80" },
  { match: /kitchen|housewares|food|drink/i, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80" },
  { match: /sport|leisure|outdoor|camping/i, url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&q=80" },
  { match: /health|beauty|perfumery|diaper/i, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80" },
  { match: /toy|baby|game/i, url: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=700&q=80" },
  { match: /book|stationery|cd|dvd/i, url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&q=80" },
  { match: /auto|car/i, url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80" },
  { match: /pet/i, url: "https://images.unsplash.com/photo-1517849845537-4d257902861a?w=700&q=80" },
];
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=700&q=80";

function imageForCategory(englishName = "") {
  const found = CATEGORY_IMAGES.find((c) => c.match.test(englishName));
  return found ? found.url : DEFAULT_IMAGE;
}

function toTitleCase(slug = "") {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(s = "") {
  return s.toLowerCase().replace(/_/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Generate a real-looking, unique catalog name for each Olist product.
// Olist does not provide product names, so these are Crate catalog names.
const NAME_PREFIXES = [
  "Nova", "Prime", "Urban", "Aero", "Vertex", "Luma", "Nexa", "Atlas",
  "Core", "Elite", "Viva", "Mira", "Pulse", "Craft", "Zenith", "Apex",
];

const NAME_VARIANTS = [
  "Essential", "Plus", "Pro", "Select", "Classic", "Premium", "Compact",
  "Advanced", "Signature", "Smart", "Everyday", "Performance",
];

function productModel(productId = "") {
  return productId.slice(0, 6).toUpperCase();
}

function catalogProductName(productId, categoryName = "Product") {
  const seed = seededInt(productId, 0, 999999);
  const prefix = NAME_PREFIXES[seed % NAME_PREFIXES.length];
  const variant = NAME_VARIANTS[Math.floor(seed / NAME_PREFIXES.length) % NAME_VARIANTS.length];
  const model = productModel(productId);
  const category = toTitleCase(categoryName || "Product");

  // Category-specific product wording makes the catalog feel natural while
  // keeping every product deterministic and unique.
  if (/air[_ -]?conditioning|climatizacao/i.test(categoryName)) {
    const forms = [
      "Split Air Conditioner", "Portable Air Conditioner", "Inverter AC",
      "Home Cooling System", "Climate Control Unit", "Cooling Comfort AC",
    ];
    return `${prefix} ${forms[seed % forms.length]} ${variant} — ${model}`;
  }
  if (/computer|pc|electronics|audio|phone|tablet/i.test(categoryName)) {
    return `${prefix} ${variant} ${category} — ${model}`;
  }
  if (/furniture|bed|bath|table|decor|garden/i.test(categoryName)) {
    return `${prefix} ${variant} ${category} Collection — ${model}`;
  }
  if (/fashion|clothes|shoe|bag|watch|underwear/i.test(categoryName)) {
    return `${prefix} ${variant} ${category} Edition — ${model}`;
  }
  return `${prefix} ${variant} ${category} — ${model}`;
}

// Small deterministic PRNG from a string, so re-running the import is stable.
function seededInt(str, min, max) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

async function batchInsert(table, columns, rows, conflictKey) {
  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const placeholders = chunk.map(() => `(${columns.map(() => "?").join(",")})`).join(",");
    const values = chunk.flatMap((r) => columns.map((c) => r[c] ?? null));
    const sql = `INSERT IGNORE INTO ${table} (${columns.join(",")}) VALUES ${placeholders}`;
    await pool.query(sql, values);
    process.stdout.write(`\r  ${table}: ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  console.log();
}

async function main() {
  console.log("Reading CSVs from", CSV_DIR);

  // ---------- 1. categories ----------
  const translations = readCsv("product_category_name_translation.csv");
  const categoryRows = translations.map((t) => {
    const en = t.product_category_name_english || t.product_category_name;
    return {
      name_pt: t.product_category_name,
      name: toTitleCase(en),
      slug: slugify(en),
      image: imageForCategory(en),
    };
  });
  categoryRows.push({ name_pt: "__uncategorized__", name: "Uncategorized", slug: "uncategorized", image: DEFAULT_IMAGE });
  await batchInsert("categories", ["name_pt", "name", "slug", "image"], categoryRows);

  const [catRows] = await pool.query("SELECT category_id, name_pt FROM categories");
  const categoryIdByPt = Object.fromEntries(catRows.map((c) => [c.name_pt, c.category_id]));
  const uncategorizedId = categoryIdByPt["__uncategorized__"];

  // ---------- 2. sellers ----------
  const sellersCsv = readCsv("olist_sellers_dataset.csv");
  const sellerRows = sellersCsv.map((s) => ({
    seller_id: s.seller_id,
    seller_zip_prefix: s.seller_zip_code_prefix,
    seller_city: s.seller_city,
    seller_state: s.seller_state,
    display_name: `${toTitleCase(s.seller_city || "Crate")} Seller ${s.seller_id.slice(0, 5)}`,
    rating: (seededInt(s.seller_id, 35, 49) / 10).toFixed(1),
  }));
  await batchInsert(
    "sellers",
    ["seller_id", "seller_zip_prefix", "seller_city", "seller_state", "display_name", "rating"],
    sellerRows
  );

  // ---------- 3. customers ----------
  const customersCsv = readCsv("olist_customers_dataset.csv");
  const customerRows = customersCsv.map((c) => ({
    customer_id: c.customer_id,
    customer_unique_id: c.customer_unique_id,
    customer_zip_prefix: c.customer_zip_code_prefix,
    customer_city: c.customer_city,
    customer_state: c.customer_state,
  }));
  await batchInsert(
    "customers",
    ["customer_id", "customer_unique_id", "customer_zip_prefix", "customer_city", "customer_state"],
    customerRows
  );

  // ---------- 4. geolocation (dedupe by zip prefix, first occurrence wins) ----------
  const geoCsv = readCsv("olist_geolocation_dataset.csv");
  const seenZip = new Set();
  const geoRows = [];
  for (const g of geoCsv) {
    const zip = g.geolocation_zip_code_prefix;
    if (seenZip.has(zip)) continue;
    seenZip.add(zip);
    geoRows.push({
      zip_code_prefix: zip,
      lat: g.geolocation_lat,
      lng: g.geolocation_lng,
      city: g.geolocation_city,
      state: g.geolocation_state,
    });
  }
  await batchInsert("geolocation", ["zip_code_prefix", "lat", "lng", "city", "state"], geoRows);

  // ---------- 5. products ----------
  const productsCsv = readCsv("olist_products_dataset.csv");
  const productRows = productsCsv.map((p) => {
    const catId = categoryIdByPt[p.product_category_name] || uncategorizedId;
    const catEnglish = catRows.find((c) => c.category_id === catId);
    const shortId = p.product_id.slice(0, 6);
    const rand = seededInt(p.product_id, 0, 99);
    return {
      product_id: p.product_id,
      category_id: catId,
      seller_id: null, // filled in during post-import aggregation, see below
      name: catalogProductName(
        p.product_id,
        (translations.find((t) => t.product_category_name === p.product_category_name) || {})
          .product_category_name_english || p.product_category_name || "Product"
      ),
      sku: `CRT-${shortId.toUpperCase()}`,
      price: 0, // filled from order_items average, see below
      discount_percent: rand < 20 ? 0 : rand < 55 ? 10 : rand < 80 ? 15 : 20,
      stock: seededInt(p.product_id, 5, 80),
      weight_g: p.product_weight_g || null,
      length_cm: p.product_length_cm || null,
      height_cm: p.product_height_cm || null,
      width_cm: p.product_width_cm || null,
      photos_qty: p.product_photos_qty || 0,
      image: imageForCategory(
        (translations.find((t) => t.product_category_name === p.product_category_name) || {})
          .product_category_name_english || ""
      ),
      description: `A ${toTitleCase(p.product_category_name || "general")} item sourced from Crate's verified seller network. Dimensions: ${p.product_length_cm || "-"}x${p.product_width_cm || "-"}x${p.product_height_cm || "-"} cm, weight ${p.product_weight_g || "-"} g.`,
      rating: 0, // filled from reviews, see below
      review_count: 0,
      units_sold: 0,
    };
  });
  await batchInsert(
    "products",
    [
      "product_id", "category_id", "seller_id", "name", "sku", "price", "discount_percent",
      "stock", "weight_g", "length_cm", "height_cm", "width_cm", "photos_qty", "image",
      "description", "rating", "review_count", "units_sold",
    ],
    productRows
  );

  // INSERT IGNORE keeps existing rows intact, so explicitly refresh names too.
  // This makes rerunning the importer apply the new catalog naming to an
  // already-populated database without requiring a DROP/CREATE.
  const nameRows = productRows.map((r) => [r.name, r.product_id]);
  for (let i = 0; i < nameRows.length; i += 1000) {
    const chunk = nameRows.slice(i, i + 1000);
    await Promise.all(chunk.map(([name, productId]) =>
      pool.query("UPDATE products SET name = ? WHERE product_id = ?", [name, productId])
    ));
    process.stdout.write(`\r  products names: ${Math.min(i + chunk.length, nameRows.length)}/${nameRows.length}`);
  }
  console.log();

  // ---------- 6. orders ----------
  const ordersCsv = readCsv("olist_orders_dataset.csv");
  const orderRows = ordersCsv.map((o) => ({
    order_id: o.order_id,
    customer_id: o.customer_id,
    order_status: o.order_status,
    order_purchase_timestamp: o.order_purchase_timestamp || null,
    order_approved_at: o.order_approved_at || null,
    order_delivered_carrier_date: o.order_delivered_carrier_date || null,
    order_delivered_customer_date: o.order_delivered_customer_date || null,
    order_estimated_delivery_date: o.order_estimated_delivery_date || null,
  }));
  await batchInsert(
    "orders",
    [
      "order_id", "customer_id", "order_status", "order_purchase_timestamp", "order_approved_at",
      "order_delivered_carrier_date", "order_delivered_customer_date", "order_estimated_delivery_date",
    ],
    orderRows
  );

  // ---------- 7. order_items ----------
  const orderItemsCsv = readCsv("olist_order_items_dataset.csv");
  const orderItemRows = orderItemsCsv.map((oi) => ({
    order_id: oi.order_id,
    order_item_id: oi.order_item_id,
    product_id: oi.product_id,
    seller_id: oi.seller_id,
    shipping_limit_date: oi.shipping_limit_date || null,
    price: oi.price,
    freight_value: oi.freight_value,
  }));
  await batchInsert(
    "order_items",
    ["order_id", "order_item_id", "product_id", "seller_id", "shipping_limit_date", "price", "freight_value"],
    orderItemRows
  );

  // ---------- 8. payments ----------
  const paymentsCsv = readCsv("olist_order_payments_dataset.csv");
  const paymentRows = paymentsCsv.map((p) => ({
    order_id: p.order_id,
    payment_sequential: p.payment_sequential,
    payment_type: p.payment_type,
    payment_installments: p.payment_installments,
    payment_value: p.payment_value,
  }));
  await batchInsert(
    "payments",
    ["order_id", "payment_sequential", "payment_type", "payment_installments", "payment_value"],
    paymentRows
  );

  // ---------- 9. reviews ----------
  const reviewsCsv = readCsv("olist_order_reviews_dataset.csv");
  const seenReview = new Set();
  const reviewRows = [];
  for (const r of reviewsCsv) {
    if (seenReview.has(r.review_id)) continue; // dataset has some duplicate review_ids
    seenReview.add(r.review_id);
    reviewRows.push({
      review_id: r.review_id,
      order_id: r.order_id,
      review_score: r.review_score,
      review_comment_title: r.review_comment_title || null,
      review_comment_message: r.review_comment_message || null,
      review_creation_date: r.review_creation_date || null,
      review_answer_timestamp: r.review_answer_timestamp || null,
    });
  }
  await batchInsert(
    "reviews",
    [
      "review_id", "order_id", "review_score", "review_comment_title", "review_comment_message",
      "review_creation_date", "review_answer_timestamp",
    ],
    reviewRows
  );

  // ---------- 10. post-import aggregation ----------
  console.log("Aggregating price / units_sold / seller_id / rating / review_count ...");

  await pool.query(`
    UPDATE products p
    JOIN (SELECT product_id, ROUND(AVG(price), 2) AS avg_price, COUNT(*) AS cnt
          FROM order_items GROUP BY product_id) t
    ON t.product_id = p.product_id
    SET p.price = t.avg_price, p.units_sold = t.cnt
  `);

  await pool.query(`
    UPDATE products p
    JOIN (
      SELECT product_id, seller_id FROM (
        SELECT product_id, seller_id,
               ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY COUNT(*) DESC) AS rn
        FROM order_items GROUP BY product_id, seller_id
      ) ranked WHERE rn = 1
    ) top ON top.product_id = p.product_id
    SET p.seller_id = top.seller_id
  `);

  await pool.query(`
    UPDATE products p
    JOIN (SELECT product_id, ROUND(AVG(review_score), 1) AS avg_score, COUNT(*) AS cnt
          FROM product_reviews GROUP BY product_id) t
    ON t.product_id = p.product_id
    SET p.rating = t.avg_score, p.review_count = t.cnt
  `);

  // Products that ended up with no matching seller (shouldn't normally happen,
  // since order_items covers every product) fall back to a random seller.
  await pool.query(`
    UPDATE products SET seller_id = (SELECT seller_id FROM sellers ORDER BY RAND() LIMIT 1)
    WHERE seller_id IS NULL
  `);

  console.log("Import complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
