import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
const db = new PrismaClient();
const origin = "http://localhost:3002";
const customer = {
  name: "Integration Customer",
  email: "customer@zoorvan.test",
  password: "integration-test-password",
};
const delivery = {
  name: customer.name,
  email: customer.email,
  phone: "03001234567",
  address: "House 10, Integration Test Street",
  city: "Lahore",
  quantity: 2,
};
async function login(page, email, password, destination = "/account") {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
}
async function post(request, path, data) {
  return request.post(path, { headers: { origin }, data });
}
test.beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes("127.0.0.1:54329"))
    throw new Error("Integration tests require the isolated local database.");
  for (const model of [
    "auditLog",
    "passwordReset",
    "review",
    "order",
    "coupon",
    "content",
    "product",
    "setting",
    "user",
  ])
    await db[model].deleteMany();
  await db.user.create({
    data: {
      name: "Test Administrator",
      email: "admin@zoorvan.test",
      passwordHash: await hash("admin-integration-password", 12),
      role: "ADMIN",
    },
  });
  await db.product.create({
    data: {
      slug: "zoorvan-majoon",
      name: "Zoorvan Majoon",
      description: "Integration test product",
      price: 2490,
      stock: 10,
      active: true,
    },
  });
  await db.setting.create({ data: { id: "store" } });
});
test.afterAll(async () => {
  await db.$disconnect();
});
test("real accounts, coupons, order totals, admin controls, inventory races and recovery", async ({
  browser,
  page,
}) => {
  const registered = await post(page.request, "/api/register", customer);
  expect(registered.status()).toBe(201);
  await login(page, customer.email, customer.password);
  const denied = await post(page.request, "/api/admin/inventory", {
    id: "any",
    data: { stock: 100 },
  });
  expect(denied.status()).toBe(403);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(
    admin,
    "admin@zoorvan.test",
    "admin-integration-password",
    "/admin",
  );
  await expect(
    admin.getByRole("navigation", { name: "Admin navigation" }),
  ).toBeVisible();
  await expect(
    admin.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(admin.getByRole("contentinfo")).toHaveCount(0);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account$/);
  await admin.goto("/account");
  await expect(admin).toHaveURL(/\/admin$/);
  await admin.goto("/admin/coupons");
  await admin.getByRole("button", { name: "Add coupon" }).click();
  await admin.getByLabel("Coupon code").fill("TEST10");
  await admin.getByLabel("Discount (%)").fill("10");
  await admin.getByLabel("Maximum uses").fill("10");
  await admin.getByLabel("Active", { exact: true }).check();
  await admin.getByRole("button", { name: "Save changes" }).click();
  await expect(admin.getByRole("status")).toContainText("Changes saved.");
  await page.goto("/shop");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto("/checkout");
  await page.getByLabel("Coupon code (optional)").fill("TEST10");
  await page.getByRole("button", { name: "Apply coupon" }).click();
  await expect(page.locator(".grand-total")).toContainText("Rs. 4,682");
  const changedQuote = await post(page.request, "/api/orders", {
    ...delivery,
    quotedTotal: 1,
  });
  expect(changedQuote.status()).toBe(409);
  expect(
    (await db.product.findUnique({ where: { slug: "zoorvan-majoon" } })).stock,
  ).toBe(10);
  const quote = await post(page.request, "/api/coupons", {
    code: "TEST10",
    quantity: 2,
  });
  expect(quote.status()).toBe(200);
  expect((await quote.json()).totals.total).toBe(4682);
  const placed = await post(page.request, "/api/orders", {
    ...delivery,
    coupon: "TEST10",
    price: 1,
    total: 1,
  });
  expect(placed.status()).toBe(201);
  const { order } = await placed.json();
  expect(order.total).toBe(4682);
  let product = await db.product.findUnique({
    where: { slug: "zoorvan-majoon" },
  });
  expect(product.stock).toBe(8);
  let saved = await db.order.findUnique({ where: { number: order.number } });
  expect(saved.userId).toBeTruthy();
  await page.goto("/account/orders");
  await expect(page.locator('.orders-list:visible').getByText(order.number, { exact: true })).toBeVisible();
  const track = await post(page.request, "/api/track", {
    number: order.number,
    phone: delivery.phone,
  });
  expect(track.status()).toBe(200);
  expect((await track.json()).order.email).toBeUndefined();
  const wrong = await post(page.request, "/api/track", {
    number: order.number,
    phone: "03009999999",
  });
  expect(wrong.status()).toBe(404);
  const skipped = await post(admin.request, "/api/admin/orders", {
    id: saved.id,
    data: { status: "DELIVERED" },
  });
  expect(skipped.status()).toBe(409);
  const cancelled = await post(admin.request, "/api/admin/orders", {
    id: saved.id,
    data: { status: "CANCELLED" },
  });
  expect(cancelled.status()).toBe(200);
  await post(admin.request, "/api/admin/orders", {
    id: saved.id,
    data: { status: "CANCELLED" },
  });
  product = await db.product.findUnique({ where: { id: product.id } });
  expect(product.stock).toBe(10);
  expect((await db.coupon.findUnique({ where: { code: "TEST10" } })).uses).toBe(
    0,
  );
  await db.product.update({ where: { id: product.id }, data: { stock: 2 } });
  const race = await Promise.all([
    post(page.request, "/api/orders", delivery),
    post(page.request, "/api/orders", delivery),
  ]);
  expect(race.map((r) => r.status()).sort()).toEqual([201, 409]);
  expect(
    (await db.product.findUnique({ where: { id: product.id } })).stock,
  ).toBe(0);
  const winner = await race.find((r) => r.status() === 201).json();
  saved = await db.order.findUnique({ where: { number: winner.order.number } });
  for (const status of ["CONFIRMED", "PROCESSING"])
    expect(
      (
        await post(admin.request, "/api/admin/orders", {
          id: saved.id,
          data: { status },
        })
      ).status(),
    ).toBe(200);
  expect(
    (
      await post(admin.request, "/api/admin/orders", {
        id: saved.id,
        data: { status: "SHIPPED" },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await post(admin.request, "/api/admin/orders", {
        id: saved.id,
        data: {
          status: "SHIPPED",
          courier: "Test courier",
          trackingNumber: "TEST-001",
        },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await post(admin.request, "/api/admin/orders", {
        id: saved.id,
        data: {
          status: "DELIVERED",
          courier: "Test courier",
          trackingNumber: "TEST-001",
        },
      })
    ).status(),
  ).toBe(200);
  const review = await post(page.request, "/api/reviews", {
    rating: 5,
    body: "The ordering process was straightforward.",
  });
  expect(review.status()).toBe(201);
  expect((await db.review.findFirst()).approved).toBe(false);
  await page.goto("/account/profile");
  await page.getByLabel("Full name").fill(customer.name);
  await page.getByLabel("Mobile number").fill(delivery.phone);
  await page.getByLabel("Delivery address").fill(delivery.address);
  await page.getByLabel("City", { exact: true }).fill(delivery.city);
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  const token = "a".repeat(64);
  await db.passwordReset.create({
    data: {
      email: customer.email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60000),
    },
  });
  expect(
    (
      await post(page.request, "/api/password/reset", {
        token,
        password: "new-integration-password",
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await post(page.request, "/api/password/reset", {
        token,
        password: "another-integration-password",
      })
    ).status(),
  ).toBe(400);
  const revoked = await post(page.request, "/api/reviews", {
    rating: 5,
    body: "This session should be revoked.",
  });
  expect(revoked.status()).toBe(401);
  expect(await db.auditLog.count()).toBeGreaterThan(5);
  await adminContext.close();
});
