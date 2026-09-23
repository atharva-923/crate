require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const pool = require("../db");
const bcrypt = require("bcrypt");

async function migrate() {
  console.log("Adding email and password_hash to customers and sellers...");
  try {
    await pool.query("ALTER TABLE customers ADD COLUMN email VARCHAR(255) UNIQUE");
    await pool.query("ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255)");
  } catch (err) {
    if (err.code !== "ER_DUP_FIELDNAME") console.error("Customer table error:", err);
  }

  try {
    await pool.query("ALTER TABLE sellers ADD COLUMN email VARCHAR(255) UNIQUE");
    await pool.query("ALTER TABLE sellers ADD COLUMN password_hash VARCHAR(255)");
  } catch (err) {
    if (err.code !== "ER_DUP_FIELDNAME") console.error("Seller table error:", err);
  }

  const demoPass = await bcrypt.hash("password", 10);
  
  try {
    await pool.query(`INSERT IGNORE INTO customers (customer_id, customer_unique_id, customer_city, customer_state, email, password_hash) 
      VALUES ('cus_demo', 'cus_demo', 'Mumbai', 'MH', 'john.doe@example.com', ?)`, [demoPass]);
  } catch (err) {
    console.error(err);
  }

  try {
    await pool.query(`INSERT IGNORE INTO sellers (seller_id, display_name, seller_city, seller_state, email, password_hash) 
      VALUES ('sel_demo', 'Demo Store', 'Mumbai', 'MH', 'seller@crate.com', ?)`, [demoPass]);
  } catch (err) {
    console.error(err);
  }

  console.log("Migration done!");
  process.exit(0);
}

migrate();
