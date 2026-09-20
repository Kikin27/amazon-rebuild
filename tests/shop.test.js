import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.js";
import {
  emptyState,
  shopReducer,
  totalCents,
  countItems,
  recoverState,
  readStorage,
  makeOrder,
  STORAGE_KEY,
} from "../src/state/shop.js";
const add = (s, id = "e01", variant = "black", quantity = 1) =>
  shopReducer(s, { type: "ADD", item: { id, variant, quantity } });
test("catalogue contains 24 products, six in each department, with integer prices and available defaults", () => {
  assert.equal(products.length, 24);
  assert.equal(new Set(products.map((p) => p.id)).size, 24);
  for (const category of ["electronics", "home", "clothing", "books"])
    assert.equal(products.filter((p) => p.category === category).length, 6);
  for (const p of products) {
    assert.ok(Number.isInteger(p.price));
    assert.ok(p.variants.some((v) => v.stock > 0));
  }
});
test("same variant accumulates; another variant remains a separate line", () => {
  let s = add(emptyState());
  s = add(s, "e01", "black", 2);
  s = add(s, "e01", "sand", 2);
  assert.deepEqual(s.cart, [
    { id: "e01", variant: "black", quantity: 3 },
    { id: "e01", variant: "sand", quantity: 2 },
  ]);
  assert.equal(countItems(s.cart), 5);
});
test("stock limits apply to add and quantity updates; unavailable and unknown options are rejected", () => {
  let s = add(emptyState(), "e01", "black", 100);
  assert.equal(s.cart[0].quantity, 8);
  s = add(s, "e01", "sage", 2);
  s = add(s, "e01", "missing", 1);
  s = add(s, "fake", "black", 1);
  assert.equal(s.cart.length, 1);
  assert.equal(
    shopReducer(s, {
      type: "QUANTITY",
      id: "e01",
      variant: "black",
      quantity: 999,
    }).cart[0].quantity,
    8,
  );
  for (const q of [0, -2, 1.3, NaN, Infinity, "2"])
    assert.deepEqual(
      shopReducer(s, {
        type: "QUANTITY",
        id: "e01",
        variant: "black",
        quantity: q,
      }),
      s,
    );
});
test("currency totals remain integer cents and include selected variant prices", () => {
  let s = add(emptyState(), "h03", "cream", 3);
  s = add(s, "b01", "hardcover", 2);
  assert.equal(totalCents(s.cart), 1699 * 3 + 2699 * 2);
  assert.ok(Number.isInteger(totalCents(s.cart)));
});
test("save and restore preserve identity and do not drop saved quantities beyond stock capacity", () => {
  let s = add(emptyState(), "e01", "black", 7);
  s = shopReducer(s, { type: "SAVE", key: "e01:black" });
  assert.equal(s.cart.length, 0);
  assert.equal(s.saved[0].quantity, 7);
  s = add(s, "e01", "black", 4);
  s = shopReducer(s, { type: "RESTORE", key: "e01:black" });
  assert.equal(s.cart[0].quantity, 8);
  assert.equal(s.saved[0].quantity, 3);
  assert.deepEqual(shopReducer(s, { type: "RESTORE", key: "e01:black" }), s);
});
test("storage recovery rejects corrupt JSON, malformed items and malformed orders", () => {
  for (const raw of ["{broken", "null", "42", "[]"])
    assert.deepEqual(recoverState(raw), emptyState());
  const s = recoverState(
    JSON.stringify({
      cart: [
        { id: "e01", variant: "black", quantity: 999 },
        { id: "unknown", variant: "x", quantity: 3 },
        { id: "e01", variant: "sage", quantity: 1 },
      ],
      wishlist: ["e01", "e01", "unknown"],
      orders: [{ id: "bad" }],
    }),
  );
  assert.deepEqual(s.cart, [{ id: "e01", variant: "black", quantity: 8 }]);
  assert.deepEqual(s.wishlist, ["e01"]);
  assert.deepEqual(s.orders, []);
});
test("storage exceptions preserve a usable session with a persistence warning", () => {
  const result = readStorage({
    getItem() {
      throw new Error("blocked");
    },
  });
  assert.deepEqual(result.state, emptyState());
  assert.match(result.warning, /not be saved/);
  assert.equal(STORAGE_KEY, "amazon-rebuild:v1");
});
test("orders snapshot prices and omit personal details; reload discards unknown sensitive keys", () => {
  const cart = add(emptyState(), "b01", "hardcover", 2).cart;
  const order = makeOrder(cart, "demo-test-1", "2026-09-20T15:00:00.000Z");
  assert.equal(order.total, 5398);
  assert.equal(order.items[0].price, 2699);
  const contaminated = {
    ...order,
    email: "private@example.test",
    address: "Do not persist",
    items: order.items.map((i) => ({ ...i, name: "Private" })),
  };
  const state = recoverState(
    JSON.stringify({ orders: [contaminated], customer: { name: "Private" } }),
  );
  assert.deepEqual(state.orders, [order]);
  assert.ok(!JSON.stringify(state).includes("Private"));
  assert.ok(!JSON.stringify(state).includes("private@example"));
});
test("placing a demo order clears cart and rejects duplicate order actions", () => {
  const s = add(emptyState());
  const order = makeOrder(s.cart, "demo-test-2");
  const done = shopReducer(s, { type: "ORDER", order });
  assert.equal(done.cart.length, 0);
  assert.equal(done.orders.length, 1);
  assert.deepEqual(shopReducer(done, { type: "ORDER", order }), done);
  assert.deepEqual(shopReducer(add(done), { type: "ORDER", order }), add(done));
});
test("reset removes this demo state; wishlist toggles work", () => {
  let s = shopReducer(add(emptyState()), { type: "WISH", id: "h03" });
  assert.deepEqual(s.wishlist, ["h03"]);
  s = shopReducer(s, { type: "WISH", id: "h03" });
  assert.deepEqual(s.wishlist, []);
  assert.deepEqual(shopReducer(s, { type: "RESET" }), emptyState());
});
