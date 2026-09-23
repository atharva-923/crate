const express = require("express");
const pool = require("../db");
const { asyncHandler, ApiError } = require("../utils");
const { authCustomer } = require("../middleware/auth");

const router = express.Router();

// GET /api/orders/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [[order]] = await pool.query("SELECT * FROM orders WHERE order_id = ?", [req.params.id]);
    if (!order) throw new ApiError(404, "Order not found");

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    const [payments] = await pool.query("SELECT * FROM payments WHERE order_id = ?", [req.params.id]);
    const [[customer]] = await pool.query(
      "SELECT customer_city, customer_state FROM customers WHERE customer_id = ?",
      [order.customer_id]
    );

    res.json({ ...order, items, payments, customer });
  })
);

// POST /api/orders
router.post(
  "/",
  authCustomer,
  asyncHandler(async (req, res) => {
    const { items, paymentMethod } = req.body;
    if (!items || !items.length) throw new ApiError(400, "Cart is empty");

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const orderId = `CRT-${Math.floor(10000 + Math.random() * 89999)}`;
      let subtotal = 0;
      const orderItemsToInsert = [];
      const stockUpdates = [];

      // Validate products and lock rows for update
      for (const item of items) {
        const [[product]] = await conn.query(
          "SELECT product_id, seller_id, price, discount_percent, stock FROM products WHERE product_id = ? FOR UPDATE",
          [item.product_id]
        );

        if (!product) throw new ApiError(404, `Product ${item.product_id} not found`);
        if (product.stock < item.qty) {
          throw new ApiError(409, `Insufficient stock for product ${item.product_id}. Available: ${product.stock}`);
        }

        const finalPrice = Math.round(product.price * (1 - (product.discount_percent || 0) / 100));
        subtotal += finalPrice * item.qty;

        // Spread qty into individual order items since order_item_id is sequential per order in schema
        for (let i = 0; i < item.qty; i++) {
          orderItemsToInsert.push([
            orderId,
            orderItemsToInsert.length + 1, // order_item_id
            product.product_id,
            product.seller_id,
            finalPrice,
            100.00 // Standard freight
          ]);
        }
        
        stockUpdates.push([item.qty, product.product_id]);
      }

      // Create order
      await conn.query(
        `INSERT INTO orders (order_id, customer_id, order_status, order_purchase_timestamp)
         VALUES (?, ?, 'created', NOW())`,
        [orderId, req.customer.customer_id]
      );

      // Create order items
      if (orderItemsToInsert.length > 0) {
        await conn.query(
          `INSERT INTO order_items (order_id, order_item_id, product_id, seller_id, shipping_limit_date, price, freight_value)
           VALUES ?`,
          [orderItemsToInsert.map(r => [r[0], r[1], r[2], r[3], new Date(Date.now() + 7*24*60*60*1000), r[4], r[5]])]
        );
      }

      // Create payment
      const deliveryFee = (subtotal === 0 || subtotal >= 2999) ? 0 : 79;
      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + deliveryFee + tax;

      await conn.query(
        `INSERT INTO payments (order_id, payment_sequential, payment_type, payment_installments, payment_value)
         VALUES (?, 1, ?, 1, ?)`,
        [orderId, paymentMethod || "credit_card", totalAmount]
      );

      // Update stock
      for (const update of stockUpdates) {
        await conn.query("UPDATE products SET stock = stock - ? WHERE product_id = ?", update);
      }

      await conn.commit();
      res.json({ order_id: orderId, status: "Order Placed" });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

module.exports = router;
