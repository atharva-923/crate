require("dotenv").config();
const pool = require("../db");

const NAME_PREFIXES = [
  "Nova", "Prime", "Urban", "Aero", "Vertex", "Luma", "Nexa", "Atlas",
  "Core", "Elite", "Viva", "Mira", "Pulse", "Craft", "Zenith", "Apex",
];
const NAME_VARIANTS = [
  "Essential", "Plus", "Pro", "Select", "Classic", "Premium", "Compact",
  "Advanced", "Signature", "Smart", "Everyday", "Performance",
];
function seededInt(str, min, max) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}
function toTitleCase(slug = "") {
  return slug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function catalogProductName(productId, categoryName = "Product") {
  const seed = seededInt(productId, 0, 999999);
  const prefix = NAME_PREFIXES[seed % NAME_PREFIXES.length];
  const variant = NAME_VARIANTS[Math.floor(seed / NAME_PREFIXES.length) % NAME_VARIANTS.length];
  const model = productId.slice(0, 6).toUpperCase();
  const category = toTitleCase(categoryName || "Product");
  if (/air[_ -]?conditioning|climatizacao/i.test(categoryName)) {
    const forms = ["Split Air Conditioner", "Portable Air Conditioner", "Inverter AC", "Home Cooling System", "Climate Control Unit", "Cooling Comfort AC"];
    return `${prefix} ${forms[seed % forms.length]} ${variant} — ${model}`;
  }
  if (/computer|pc|electronics|audio|phone|tablet/i.test(categoryName)) return `${prefix} ${variant} ${category} — ${model}`;
  if (/furniture|bed|bath|table|decor|garden/i.test(categoryName)) return `${prefix} ${variant} ${category} Collection — ${model}`;
  if (/fashion|clothes|shoe|bag|watch|underwear/i.test(categoryName)) return `${prefix} ${variant} ${category} Edition — ${model}`;
  return `${prefix} ${variant} ${category} — ${model}`;
}

async function main() {
  const [rows] = await pool.query(`
    SELECT p.product_id, COALESCE(c.name, 'Product') AS category_name
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
  `);
  console.log(`Refreshing ${rows.length} product names...`);
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    await Promise.all(chunk.map(r => pool.query(
      "UPDATE products SET name = ? WHERE product_id = ?",
      [catalogProductName(r.product_id, r.category_name), r.product_id]
    )));
    process.stdout.write(`\r${Math.min(i + chunk.length, rows.length)}/${rows.length}`);
  }
  console.log("\nProduct names refreshed successfully.");
  await pool.end();
}
main().catch(async err => { console.error(err); try { await pool.end(); } catch {} process.exit(1); });
