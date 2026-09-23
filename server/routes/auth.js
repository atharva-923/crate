const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/customer/login
router.post(
  "/customer/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");

    const [[customer]] = await pool.query("SELECT * FROM customers WHERE email = ?", [email]);
    if (!customer) throw new ApiError(401, "Incorrect email or password");

    if (!customer.password_hash) {
      // For legacy customers lacking a password
      throw new ApiError(401, "Please reset your password to log in");
    }

    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) throw new ApiError(401, "Incorrect email or password");

    const token = generateToken({ customer_id: customer.customer_id, email: customer.email });
    res.cookie("crate_customer_token", token, COOKIE_OPTIONS);
    
    // Return customer data without password hash
    const { password_hash, ...safeCustomer } = customer;
    res.json(safeCustomer);
  })
);

// POST /api/auth/customer/register
router.post(
  "/customer/register",
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, city, state } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");

    // Check if email exists
    const [[existing]] = await pool.query("SELECT email FROM customers WHERE email = ?", [email]);
    if (existing) throw new ApiError(409, "Email is already registered");

    const hash = await bcrypt.hash(password, 10);
    const customer_id = `cus_${Date.now()}`;

    await pool.query(
      `INSERT INTO customers (customer_id, customer_unique_id, customer_zip_prefix, customer_city, customer_state, email, password_hash) 
       VALUES (?, ?, '400001', ?, ?, ?, ?)`,
      [customer_id, customer_id, city || "Mumbai", state || "MH", email, hash]
    );

    const token = generateToken({ customer_id, email });
    res.cookie("crate_customer_token", token, COOKIE_OPTIONS);
    
    res.json({
      customer_id,
      email,
      customer_city: city || "Mumbai",
      customer_state: state || "MH"
    });
  })
);

// POST /api/auth/customer/logout
router.post("/customer/logout", (req, res) => {
  res.clearCookie("crate_customer_token", COOKIE_OPTIONS);
  res.json({ success: true });
});

// POST /api/auth/seller/login
router.post(
  "/seller/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");

    const [[seller]] = await pool.query("SELECT * FROM sellers WHERE email = ?", [email]);
    if (!seller) throw new ApiError(401, "Incorrect email or password");

    if (!seller.password_hash) {
      throw new ApiError(401, "Please reset your password to log in");
    }

    const match = await bcrypt.compare(password, seller.password_hash);
    if (!match) throw new ApiError(401, "Incorrect email or password");

    const token = generateToken({ seller_id: seller.seller_id, email: seller.email });
    res.cookie("crate_seller_token", token, COOKIE_OPTIONS);
    
    const { password_hash, ...safeSeller } = seller;
    res.json(safeSeller);
  })
);

// POST /api/auth/seller/register
router.post(
  "/seller/register",
  asyncHandler(async (req, res) => {
    const { email, password, storeName, city, state } = req.body;
    if (!email || !password || !storeName) throw new ApiError(400, "Email, password, and store name are required");

    const [[existing]] = await pool.query("SELECT email FROM sellers WHERE email = ?", [email]);
    if (existing) throw new ApiError(409, "Email is already registered");

    const hash = await bcrypt.hash(password, 10);
    const seller_id = `sel_${Date.now()}`;

    await pool.query(
      `INSERT INTO sellers (seller_id, seller_zip_prefix, seller_city, seller_state, display_name, rating, email, password_hash) 
       VALUES (?, '400001', ?, ?, ?, 4.5, ?, ?)`,
      [seller_id, city || "Mumbai", state || "MH", storeName, email, hash]
    );

    const token = generateToken({ seller_id, email });
    res.cookie("crate_seller_token", token, COOKIE_OPTIONS);
    
    res.json({
      seller_id,
      email,
      display_name: storeName,
      seller_city: city || "Mumbai",
      seller_state: state || "MH",
      rating: 4.5
    });
  })
);

// POST /api/auth/seller/logout
router.post("/seller/logout", (req, res) => {
  res.clearCookie("crate_seller_token", COOKIE_OPTIONS);
  res.json({ success: true });
});

module.exports = router;
