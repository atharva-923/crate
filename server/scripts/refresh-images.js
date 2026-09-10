/**
 * Refresh product images in the EXISTING products table.
 *
 * Important: this script only UPDATEs existing rows. It does NOT INSERT
 * products, because products.name is NOT NULL and the product rows already
 * exist in crate_db.
 *
 * Usage:
 *   npm run refresh-images
 */
require("dotenv").config();
const crypto = require("crypto");
const pool = require("../db");

const CATEGORY_KEYWORDS = {
  "agro industry and commerce": "agriculture,farming",
  "air conditioning": "air conditioner,air conditioning",
  "art": "art,painting",
  "arts and craftmanship": "arts,crafts",
  "audio": "audio,speakers,headphones",
  "auto": "car,automotive",
  "baby": "baby,infant",
  "bed bath table": "bedroom,bathroom,home",
  "books general interest": "books,reading",
  "books imported": "books,reading",
  "books technical": "technical,books,technology",
  "cds dvds musicals": "music,cd,dvd",
  "christmas supplies": "christmas,holiday",
  "cine photo": "camera,photography",
  "computers": "computer,laptop,desktop",
  "computers accessories": "computer,keyboard,mouse",
  "consoles games": "gaming,console,video games",
  "construction tools": "construction,tools",
  "construction": "construction,tools",
  "cool stuff": "gadgets,products",
  "costruction tools": "construction,tools",
  "electronics": "electronics,gadgets",
  "fashio female clothing": "fashion,women,clothing",
  "fashion bags and accessories": "fashion,bags,accessories",
  "fashion male clothing": "fashion,men,clothing",
  "fashion shoes": "shoes,footwear",
  "fashion sport": "sportswear,fitness",
  "fashion undergarments": "underwear,clothing",
  "flowers": "flowers,garden",
  "food": "food,grocery",
  "food drink": "food,drink",
  "furniture bedroom": "bedroom,furniture",
  "furniture decor": "furniture,home,decor",
  "furniture living room": "living room,furniture",
  "furniture mattress and upholstery": "mattress,furniture",
  "garden tools": "garden,tools",
  "health beauty": "health,beauty",
  "home appliances": "home appliances,kitchen",
  "home comfort": "home,comfort",
  "home construction": "home,construction",
  "home computers": "computer,home electronics",
  "home_confort": "home,comfort",
  "home appliances 2": "home appliances",
  "industry commerce and business": "business,office",
  "kitchen dining laundry garden furniture": "kitchen,home,furniture",
  "la cuisine": "kitchen,cooking",
  "luggage accessories": "luggage,travel",
  "market place": "shopping,products",
  "musical instruments": "musical instruments,music",
  "office furniture": "office,furniture",
  "party supplies": "party,supplies",
  "perfumery": "perfume,fragrance",
  "pet shop": "pet,animals",
  "signaling and security": "security,alarm",
  "small appliances": "small appliances,kitchen",
  "small appliances home oven and coffee": "coffee maker,oven,kitchen",
  "sports leisure": "sports,fitness",
  "stationery": "stationery,office",
  "tablets printing image": "tablet,printer,electronics",
  "telephony": "smartphone,phone",
  "toys": "toys,games",
  "watches gifts": "watches,accessories",
  "uncategorized": "shopping,product"
};

function keywordForCategory(name) {
  const key = String(name || "uncategorized").trim().toLowerCase();
  return CATEGORY_KEYWORDS[key] || key.replace(/[^a-z0-9]+/g, ",") || "shopping,product";
}

function stableLock(productId) {
  const hex = crypto.createHash("md5").update(String(productId)).digest("hex");
  // Keep it within a safe positive JS integer range.
  return parseInt(hex.slice(0, 8), 16);
}

function imageUrl(categoryName, productId) {
  const keywords = keywordForCategory(categoryName);
  const lock = stableLock(productId);
  return `https://loremflickr.com/700/700/${encodeURIComponent(keywords)}/all?lock=${lock}`;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function main() {
  const [products] = await pool.query(`
    SELECT p.product_id, COALESCE(c.name, 'Uncategorized') AS category_name
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    ORDER BY p.product_id
  `);

  console.log(`Refreshing category-relevant images for ${products.length} existing products...`);

  const batches = chunk(products, 500);
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const cases = [];
    const params = [];
    const ids = [];

    for (const product of batch) {
      cases.push("WHEN ? THEN ?");
      params.push(product.product_id, imageUrl(product.category_name, product.product_id));
      ids.push(product.product_id);
    }

    const placeholders = ids.map(() => "?").join(",");
    const sql = `
      UPDATE products
      SET image = CASE product_id ${cases.join(" ")} ELSE image END
      WHERE product_id IN (${placeholders})
    `;

    await pool.query(sql, [...params, ...ids]);
    process.stdout.write(`\r  ${Math.min((batchIndex + 1) * 500, products.length)}/${products.length}`);
  }

  console.log("\nImage refresh complete. Existing product rows were updated; nothing was inserted.");
  await pool.end();
}

main().catch(async (err) => {
  console.error("\nImage refresh failed:", err);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
});
