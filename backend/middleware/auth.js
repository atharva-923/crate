const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_change_in_production";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function authCustomer(req, res, next) {
  const token = req.cookies.crate_customer_token;
  if (!token) return res.status(401).json({ error: "Unauthorized. Please log in." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

function authSeller(req, res, next) {
  const token = req.cookies.crate_seller_token;
  if (!token) return res.status(401).json({ error: "Unauthorized. Seller login required." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.seller = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

module.exports = { generateToken, authCustomer, authSeller };
