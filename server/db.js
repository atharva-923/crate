const mysql = require("mysql2/promise");
require("dotenv").config();

// Connection pool — never string-concatenate SQL, always use
// parameterized placeholders (?) with pool.query/execute.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "crate_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true, // so DECIMAL columns come back as JS numbers, not strings
});

module.exports = pool;
