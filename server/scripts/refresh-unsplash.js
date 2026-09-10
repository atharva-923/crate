/**
 * Refresh existing Crate product images using the Unsplash API.
 *
 * IMPORTANT:
 * - This script ONLY updates products that already exist.
 * - It never INSERTs into products.
 * - It makes one Unsplash search request per image bucket, not one request
 *   per product, so it stays within the normal demo rate limit.
 *
 * Required in server/.env:
 *   UNSPLASH_ACCESS_KEY=your_access_key
 *
 * Run from server/:
 *   npm run refresh-unsplash
 */
require("dotenv").config();
const pool = require("../db");

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  throw new Error("Missing UNSPLASH_ACCESS_KEY in server/.env");
}

const API = "https://api.unsplash.com/search/photos";

// Olist has many very specific categories. We intentionally consolidate them
// into a small number of visual buckets so the API is not called 70+ times.
const BUCKETS = [
  { match: /air.?conditioning|air.?conditioner/i, query: "air conditioner home cooling" },
  { match: /computer|pc|laptop|electronics|phone|tablet|audio|telephony/i, query: "computer laptop electronics" },
  { match: /furniture|bed|bath|home|decor|garden|office/i, query: "home furniture interior" },
  { match: /kitchen|housewares|small.?appliances/i, query: "kitchen appliances home" },
  { match: /fashion|clothing|shoe|bag|watch|fashion|underwear/i, query: "fashion clothing accessories" },
  { match: /beauty|perfumery|cosmetic|health/i, query: "beauty cosmetics skincare" },
  { match: /baby|diaper|toys|games/i, query: "baby toys children products" },
  { match: /book|stationery|books|music|cd|dvd/i, query: "books reading stationery" },
  { match: /sport|leisure|outdoor|camping/i, query: "sports fitness equipment" },
  { match: /auto|car|motorcycle/i, query: "car automotive" },
  { match: /pet|animal/i, query: "pet products animals" },
  { match: /tools|construction|security/i, query: "tools construction hardware" },
  { match: /jewelry|accessories/i, query: "jewelry accessories" },
  { match: /food|drink|market/i, query: "food grocery products" },
  { match: /agriculture|farming/i, query: "agriculture farming equipment" },
];

const FALLBACK_QUERY = "ecommerce products shopping";

function bucketForCategory(name = "") {
  return BUCKETS.find((b) => b.match.test(name)) || { query: FALLBACK_QUERY };
}

async function searchPhotos(query) {
  const url = new URL(API);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "30");
  url.searchParams.set("orientation", "squarish");

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unsplash ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  return (data.results || [])
    .filter((p) => p?.urls?.regular && p?.id)
    .map((p) => ({
      id: p.id,
      image: p.urls.regular,
      photographer: p.user?.name || "Unsplash photographer",
      photographerUrl: p.user?.links?.html || "https://unsplash.com/",
      photoUrl: p.links?.html || "https://unsplash.com/",
    }));
}

async function main() {
  const [rows] = await pool.query(`
    SELECT
      p.product_id,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    ORDER BY p.product_id
  `);

  console.log(`Found ${rows.length} existing products.`);
  console.log("Fetching category-relevant image pools from Unsplash...");

  const pools = new Map();
  const queries = new Map();

  for (const row of rows) {
    const query = bucketForCategory(row.category_name || "").query;
    queries.set(row.product_id, query);
  }

  const uniqueQueries = [...new Set(queries.values())];

  for (let i = 0; i < uniqueQueries.length; i++) {
    const query = uniqueQueries[i];
    process.stdout.write(`\n[${i + 1}/${uniqueQueries.length}] ${query}`);
    const photos = await searchPhotos(query);

    if (!photos.length) {
  console.log(` -> no results, using fallback search`);
  const fallbackPhotos = await searchPhotos("children toys");
  
  if (!fallbackPhotos.length) {
    throw new Error(`No Unsplash results for "${query}" or fallback`);
  }

  pools.set(query, fallbackPhotos);
  continue;
}

    pools.set(query, photos);
    process.stdout.write(` -> ${photos.length} photos`);
  }

  console.log("\n\nUpdating existing products only...");

  const updateSql = `
    UPDATE products
    SET image = ?
    WHERE product_id = ?
  `;

  // Group by query so each product receives a different image from its
  // relevant pool. The product_id order is stable, so reruns are deterministic.
  const counters = new Map();
  let updated = 0;

  for (const row of rows) {
    const query = queries.get(row.product_id);
    const poolPhotos = pools.get(query);
    const index = counters.get(query) || 0;
    const photo = poolPhotos[index % poolPhotos.length];
    counters.set(query, index + 1);

    await pool.execute(updateSql, [photo.image, row.product_id]);

    updated++;
    if (updated % 500 === 0 || updated === rows.length) {
      process.stdout.write(`\r  ${updated}/${rows.length}`);
    }
  }

  console.log("\n\nDone.");
  console.log(`Updated ${updated} existing product rows.`);
  console.log("No products were inserted.");
  console.log("Images are hotlinked directly from Unsplash URLs returned by the API.");
  console.log("\nNote: Unsplash API photos require attribution in the UI.");
  console.log("Store/display the photographer + Unsplash credit if you keep these images.");
}

main()
  .catch((err) => {
    console.error("\n\nImage refresh failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await pool.end(); } catch {}
  });
