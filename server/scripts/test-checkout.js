require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const BASE_URL = "http://localhost:4000/api";

async function run() {
  console.log("Starting backend manual test flow...");

  // 1. Auth Test
  const email = `test_${Date.now()}@example.com`;
  let cookie;

  console.log("Registering customer...");
  let res = await fetch(`${BASE_URL}/auth/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123", firstName: "Test", lastName: "User" })
  });
  let body = await res.json();
  if (!res.ok) throw new Error(body.error);
  cookie = res.headers.get("set-cookie");
  console.log("✓ Customer registered", body);

  console.log("Logging in customer...");
  res = await fetch(`${BASE_URL}/auth/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" })
  });
  body = await res.json();
  if (!res.ok) throw new Error(body.error);
  cookie = res.headers.get("set-cookie");
  console.log("✓ Customer logged in", body.customer_id);

  // 2. Products Test
  console.log("Fetching products...");
  res = await fetch(`${BASE_URL}/products?limit=1`);
  body = await res.json();
  const product = body.products[0];
  console.log("✓ Found product", product.product_id, "Stock:", product.stock);

  if (!product.stock) {
    console.log("Cannot test checkout on out of stock product.");
    process.exit(0);
  }

  // 3. Checkout Test
  console.log("Testing checkout transaction...");
  res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie,
    },
    body: JSON.stringify({
      items: [{ product_id: product.product_id, qty: 1 }],
      paymentMethod: "credit_card"
    })
  });
  
  body = await res.json();
  if (!res.ok) throw new Error(body.error);
  console.log("✓ Checkout successful. Order:", body.order_id);

  // Validate stock decrement
  res = await fetch(`${BASE_URL}/products/${product.product_id}`);
  body = await res.json();
  console.log("✓ Stock decremented to:", body.stock);

  if (body.stock !== product.stock - 1) {
    throw new Error("Stock did not decrement correctly!");
  }

  console.log("All tests passed!");
  process.exit(0);
}

run().catch(console.error);
