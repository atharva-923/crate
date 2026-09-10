require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const sellersRouter = require("./routes/sellers");
const ordersRouter = require("./routes/orders");
const customersRouter = require("./routes/customers");
const reviewsRouter = require("./routes/reviews");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/sellers", sellersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Centralized error handler — the frontend never sees a raw SQL/connection error.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Crate API listening on http://localhost:${PORT}`));
