// Mirrors a future `customers` table: customer_id, personal/contact/address details, timestamps
// NOTE: passwords are never stored in real form here — this is mock/demo data only,
// and the auth service simulates a backend rather than performing real authentication.
export const demoCustomer = {
  customer_id: "cus_1001",
  first_name: "Demo",
  last_name: "Customer",
  email: "demo@crate.test",
  phone: "+91 90000 12345",
  created_at: "2025-11-02T00:00:00.000Z",
  addresses: [
    {
      address_id: "addr_1",
      label: "Home",
      line1: "402 Willow Court",
      line2: "Baner Road",
      city: "Pune",
      state: "Maharashtra",
      postal_code: "411045",
      country: "India",
      is_default: true,
    },
  ],
};

export const demoSeller = {
  seller_id: "sel_001",
  store_name: "Northgate Home Co.",
  owner_name: "Priya Nair",
  email: "seller@crate.test",
  phone: "+91 98200 11223",
};
