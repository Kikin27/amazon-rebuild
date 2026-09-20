import { test, expect } from "@playwright/test";
async function addHeadphones(page) {
  await page.goto("/products/e01");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
}
test("search, URL filters, sorting and no-match recovery", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("wireless");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=wireless/);
  await expect(page.locator(".product-card")).toHaveCount(2);
  if (isMobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByRole("radio", { name: "4.5 stars & up", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "4.5 stars & up", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByLabel("Sort by").selectOption("price-desc");
  await page.reload();
  await expect(page).toHaveURL(/rating=4.5/);
  await expect(page.getByLabel("Sort by")).toHaveValue("price-desc");
  await page.getByRole("button", { name: "Remove filter “wireless”" }).click();
  await expect(page).not.toHaveURL(/q=wireless/);
  await expect(
    page.getByRole("button", { name: "Remove filter “wireless”" }),
  ).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("zzzxnoitem");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No finds this time." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(24);
});
test("variant-aware cart, stock, persistence, saved items and wishlist", async ({
  page,
}) => {
  await addHeadphones(page);
  await page.getByRole("button", { name: "Sand", exact: true }).click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByRole("button", { name: /Sage/ })).toBeDisabled();
  await page
    .getByRole("button", { name: "Add to wishlist", exact: true })
    .click();
  await page.goto("/cart");
  await expect(page.locator(".cart-line")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".cart-line")).toHaveCount(2);
  const black = page.locator(".cart-line").filter({ hasText: "Black" });
  await black.getByRole("button", { name: /Increase/ }).click();
  await expect(black.getByLabel("Quantity 2", { exact: true })).toBeVisible();
  await black.getByRole("button", { name: "Save for later" }).click();
  await expect(page.locator(".saved-section .cart-line")).toHaveCount(1);
  await page
    .locator(".saved-section")
    .getByRole("button", { name: "Move to cart" })
    .click();
  await expect(page.locator(".saved-section")).toHaveCount(0);
  await page.goto("/wishlist");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A home for your next favorites." }),
  ).toBeVisible();
});
test("checkout validates, places one non-sensitive order, persists and handles direct links", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await addHeadphones(page);
  await page.goto("/checkout");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await expect(
    page.getByText("Enter your full name.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#name")).toBeFocused();
  for (const [id, value] of Object.entries({
    name: "Demo Shopper",
    email: "shopper@example.test",
    address: "123 Sample Street",
    city: "Sample City",
    region: "CA",
    postal: "90210",
  }))
    await page.locator(`#${id}`).fill(value);
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await expect(page).toHaveURL(/order-success\/demo-/);
  await expect(
    page.getByRole("heading", { name: "Your demo order is in!" }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    localStorage.getItem("amazon-rebuild:v1"),
  );
  expect(stored).not.toContain("Demo Shopper");
  expect(stored).not.toContain("shopper@example.test");
  expect(stored).not.toContain("123 Sample Street");
  expect(JSON.parse(stored).orders).toHaveLength(1);
  expect(JSON.parse(stored).cart).toHaveLength(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your demo order is in!" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "View order details", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Order details", exact: true }),
  ).toBeVisible();
  await page.goto("/orders");
  await expect(page.locator(".order-card")).toHaveCount(1);
  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Let’s find something first." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("corrupt storage, unavailable storage, not-found and account reset remain usable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("amazon-rebuild:v1", "{bad json"),
  );
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", {
      name: "Your cart is waiting for a good find.",
    }),
  ).toBeVisible();
  await page.goto("/products/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "That product is off the shelf." }),
  ).toBeVisible();
  await page.goto("/orders/demo-missing");
  await expect(
    page.getByRole("heading", { name: "We couldn’t find that demo order." }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await addHeadphones(page);
  await expect(page.getByRole("alert")).toContainText(/storage is unavailable/);
  await page.getByRole("link", { name: "Cart, 1 items", exact: true }).click();
  await expect(page.locator(".cart-line")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Hello, explorer Demo account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Yes, reset demo data", exact: true })
    .click();
  await expect(
    page.getByText("0 items · Pick up where you left off"),
  ).toBeVisible();
});
test("keyboard menu and responsive pages have loaded images and no document overflow", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const appErrors = [];
  page.on("pageerror", (error) => appErrors.push(error.message));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/products",
      "/products/e01",
      "/cart",
      "/wishlist",
      "/orders",
      "/account",
      "/not-found",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await page.locator("img").evaluateAll((imgs) => {
        imgs.forEach((i) => (i.loading = "eager"));
        return Promise.all(imgs.map((i) => i.decode().catch(() => {})));
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${route} overflow at ${width}`,
      ).toBe(true);
      expect(
        await page
          .locator("img")
          .evaluateAll((imgs) =>
            imgs
              .filter((i) => !i.complete || i.naturalWidth === 0)
              .map((i) => i.src),
          ),
        `${route} broken images`,
      ).toEqual([]);
    }
    await page.goto("/");
    await page.locator("img").evaluateAll((imgs) => {
      imgs.forEach((i) => (i.loading = "eager"));
      return Promise.all(imgs.map((i) => i.decode().catch(() => {})));
    });
    await page.screenshot({
      path: `docs/qa/home-${width}-${testInfo.project.name}.png`,
      fullPage: true,
      scale: "css",
    });
  }
  expect(appErrors).toEqual([]);
  await page.getByRole("button", { name: "All", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "All", exact: true }),
  ).toBeFocused();
});

test("gallery, stock caps and Buy Now work with responsive populated checkout", async ({
  page,
}, testInfo) => {
  await page.goto("/products/e01");
  await page
    .getByRole("button", { name: "Show detail crop", exact: true })
    .click();
  await expect(page.locator(".gallery-image img")).toHaveAttribute(
    "src",
    "/images/headphones-detail.jpg",
  );
  await page
    .getByRole("button", { name: "Show full product image", exact: true })
    .click();
  await page.getByLabel("Quantity", { exact: true }).selectOption("7");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add to Cart", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Sand", exact: true }).click();
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.locator(".summary-total")).toContainText("$719.91");
  if (testInfo.project.name === "desktop") {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [name, route] of [
        ["product", "/products/e01"],
        ["cart", "/cart"],
        ["checkout", "/checkout"],
      ]) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        await page.locator("img").evaluateAll((imgs) => {
          imgs.forEach((i) => (i.loading = "eager"));
          return Promise.all(imgs.map((i) => i.decode().catch(() => {})));
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          `${name} populated overflow at ${width}`,
        ).toBe(true);
        await page.screenshot({
          path: `docs/qa/${name}-${width}.png`,
          fullPage: true,
          scale: "css",
        });
      }
    }
  }
});
