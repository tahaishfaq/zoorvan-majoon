import test from "node:test";
import assert from "node:assert/strict";
import { calculateTotals, defaultSettings } from "../src/lib/catalog.js";
import { checkoutSchema, registerSchema } from "../src/lib/validation.js";
import { rateLimit, sameOrigin } from "../src/lib/security.js";
test("cash-on-delivery totals use integer PKR and free delivery threshold", () => {
  assert.deepEqual(calculateTotals(2490, 1), {
    subtotal: 2490,
    discount: 0,
    shipping: 200,
    total: 2690,
  });
  assert.equal(calculateTotals(2490, 3).shipping, 0);
  assert.equal(calculateTotals(2500, 2).shipping, 0);
});
test("discounts are rounded down and delivery uses discounted subtotal", () => {
  assert.deepEqual(calculateTotals(2490, 2, defaultSettings, 15), {
    subtotal: 4980,
    discount: 747,
    shipping: 200,
    total: 4433,
  });
  assert.equal(calculateTotals(2500, 2, defaultSettings, 10).shipping, 200);
});
test("quantity manipulation is rejected", () => {
  for (const n of [-1, 0, 21, 1.5, NaN])
    assert.throws(() => calculateTotals(2490, n));
});
test("checkout rejects invalid Pakistani numbers and strips untrusted prices", async () => {
  const input = {
    name: "Test Customer",
    email: "customer@example.com",
    phone: "03001234567",
    address: "House 10, Test Street",
    city: "Lahore",
    quantity: 2,
    total: 1,
    price: 1,
  };
  const clean = await checkoutSchema.validate(input, { stripUnknown: true });
  assert.equal(clean.total, undefined);
  assert.equal(clean.price, undefined);
  await assert.rejects(checkoutSchema.validate({ ...input, phone: "12345" }));
  await assert.rejects(checkoutSchema.validate({ ...input, quantity: 100 }));
});
test("account registration enforces password length", async () => {
  await assert.rejects(
    registerSchema.validate({
      name: "Test",
      email: "test@example.com",
      password: "short",
    }),
  );
});
test("cross-origin writes are rejected", () => {
  assert.equal(
    sameOrigin(
      new Request("https://zoorvan.example/api/orders", {
        headers: { origin: "https://attacker.example" },
      }),
    ),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request("https://zoorvan.example/api/orders", {
        headers: { origin: "https://zoorvan.example" },
      }),
    ),
    true,
  );
  assert.equal(
    sameOrigin(new Request("https://zoorvan.example/api/orders")),
    false,
  );
});
test("rate limit expires requests after its budget", () => {
  const key = `test-${Date.now()}`;
  assert.equal(rateLimit(key, 2), true);
  assert.equal(rateLimit(key, 2), true);
  assert.equal(rateLimit(key, 2), false);
});
