import { test, expect } from "@playwright/test";
test("bag persists, preview checkout validates and tracking verifies mobile", async ({
  page,
}) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.getByRole("link", { name: "View bag →" }).click();
  await expect(page.getByText("Rs. 5,180", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Rs. 5,180", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await page.getByRole("button", { name: "Try preview order" }).click();
  await expect(page.getByText("Full name is required.")).toBeVisible();
  await page.getByLabel("Full name").fill("Test Customer");
  await page.getByLabel("Mobile number").fill("03001234567");
  await page.getByLabel("Email address").fill("customer@example.com");
  await page.getByLabel("City", { exact: true }).fill("Lahore");
  await page
    .getByLabel("Complete delivery address")
    .fill("House 10, Test Street, Test Area");
  await page.getByRole("button", { name: "Try preview order" }).click();
  await expect(
    page.getByRole("heading", { name: "That’s how easy it is." }),
  ).toBeVisible();
  const order = await page
    .locator(".confirmation-details strong")
    .first()
    .innerText();
  await page
    .locator(".confirmation")
    .getByRole("link", { name: "Track your order" })
    .click();
  await page.getByLabel("Order number").fill(order);
  await page.getByLabel("Mobile number").fill("03009999999");
  await page.getByRole("button", { name: "Track order", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "No matching preview",
  );
  await page.getByLabel("Mobile number").fill("03001234567");
  await page.getByRole("button", { name: "Track order", exact: true }).click();
  await expect(
    page.getByText("Preview only. This parcel will not be dispatched."),
  ).toBeVisible();
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Your bag is waiting." }),
  ).toBeVisible();
});
test("storefront routes resolve and admin routes require sign-in", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/order-success",
    "/track-order",
    "/contact",
    "/terms-and-conditions",
    "/privacy-policy",
    "/login",
    "/register",
    "/forgot-password",
    "/account",
    "/account/profile",
    "/account/orders",
    "/account/history",
    "/account/settings",
    ...[
      "",
      "/orders",
      "/products",
      "/inventory",
      "/customers",
      "/coupons",
      "/reviews",
      "/content",
      "/settings",
      "/staff",
      "/reports",
      "/activity",
    ].map((s) => "/admin" + s),
  ]) {
    const response = await page.goto(path);
    if (path.startsWith("/admin")) {
      await expect(page).toHaveURL(/\/login$/);
      await expect(
        page.getByRole("navigation", { name: "Admin navigation" }),
      ).toHaveCount(0);
    } else {
      expect(response.status(), path).toBe(200);
    }
    await expect(page.locator("h1").first()).toBeVisible();
  }
});
test("mobile navigation, FAQs and no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Shop Majoon" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await page
    .locator("#main summary:visible")
    .filter({ hasText: "Can I pay cash on delivery?" })
    .click();
  await expect(
    page
      .locator("#main")
      .getByText("Yes. The store is being built around cash on delivery", {
        exact: false,
      }),
  ).toBeVisible();
  for (const path of [
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/track-order",
    "/login",
    "/admin",
    "/admin/products",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
  }
});
test("unauthenticated admin mutations and cross-origin requests are denied", async ({
  request,
}) => {
  const denied = await request.post("/api/admin/inventory", {
    headers: { origin: "http://localhost:3001" },
    data: { id: "preview", data: { stock: 100 } },
  });
  expect(denied.status()).toBe(403);
  const foreign = await request.post("/api/orders", {
    headers: { origin: "https://other.example" },
    data: {},
  });
  expect(foreign.status()).toBe(403);
  const preview = await request.post("/api/orders", {
    headers: { origin: "http://localhost:3001" },
    data: {},
  });
  expect(preview.status()).toBe(503);
});
