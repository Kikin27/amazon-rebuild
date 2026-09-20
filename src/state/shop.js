import { getProduct, getVariant } from "../data/products.js";
export const STORAGE_KEY = "amazon-rebuild:v1";
export const emptyState = () => ({
  cart: [],
  saved: [],
  wishlist: [],
  orders: [],
});
export const itemKey = (id, variant) => `${id}:${variant}`;
export const countItems = (cart) =>
  cart.reduce((n, item) => n + item.quantity, 0);
export const totalCents = (cart) =>
  cart.reduce(
    (sum, item) =>
      sum +
      (getVariant(getProduct(item.id), item.variant)?.price || 0) *
        item.quantity,
    0,
  );
export function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  const map = new Map();
  for (const item of items) {
    const p = getProduct(item?.id),
      v = getVariant(p, item?.variant);
    if (!v || !v.stock || !Number.isInteger(item.quantity) || item.quantity < 1)
      continue;
    const key = itemKey(p.id, v.id),
      old = map.get(key);
    map.set(key, {
      id: p.id,
      variant: v.id,
      quantity: Math.min(v.stock, item.quantity + (old?.quantity || 0)),
    });
  }
  return [...map.values()];
}
function validOrder(o) {
  return (
    o &&
    typeof o.id === "string" &&
    /^demo-[a-z0-9-]+$/i.test(o.id) &&
    typeof o.createdAt === "string" &&
    Number.isFinite(Date.parse(o.createdAt)) &&
    o.status === "Simulated order placed" &&
    Array.isArray(o.items) &&
    o.items.length > 0 &&
    o.items.every(
      (i) =>
        typeof i.id === "string" &&
        typeof i.title === "string" &&
        typeof i.variant === "string" &&
        typeof i.image === "string" &&
        i.image.startsWith("/images/") &&
        Number.isInteger(i.price) &&
        i.price >= 0 &&
        i.price < 10000000 &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0 &&
        i.quantity <= 100,
    ) &&
    Number.isSafeInteger(o.total) &&
    o.total === o.items.reduce((s, i) => s + i.price * i.quantity, 0)
  );
}
export function cleanOrder(o) {
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    total: o.total,
    items: o.items.map((i) => ({
      id: i.id,
      title: i.title,
      variant: i.variant,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    })),
  };
}
export function recoverState(raw) {
  try {
    if (!raw) return emptyState();
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object") return emptyState();
    return {
      cart: normalizeItems(s.cart),
      saved: normalizeItems(s.saved),
      wishlist: Array.isArray(s.wishlist)
        ? [...new Set(s.wishlist.filter((id) => getProduct(id)))]
        : [],
      orders: Array.isArray(s.orders)
        ? s.orders.filter(validOrder).map(cleanOrder)
        : [],
    };
  } catch {
    return emptyState();
  }
}
export function readStorage(storage) {
  try {
    return { state: recoverState(storage.getItem(STORAGE_KEY)), warning: "" };
  } catch {
    return {
      state: emptyState(),
      warning:
        "Browser storage is unavailable. You can keep shopping, but this session will not be saved.",
    };
  }
}
export function shopReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return { ...state, cart: normalizeItems([...state.cart, action.item]) };
    case "QUANTITY": {
      const v = getVariant(getProduct(action.id), action.variant);
      if (!v || !Number.isInteger(action.quantity) || action.quantity < 1)
        return state;
      return {
        ...state,
        cart: state.cart.map((i) =>
          itemKey(i.id, i.variant) === itemKey(action.id, action.variant)
            ? { ...i, quantity: Math.min(v.stock, action.quantity) }
            : i,
        ),
      };
    }
    case "REMOVE":
      return {
        ...state,
        cart: state.cart.filter((i) => itemKey(i.id, i.variant) !== action.key),
      };
    case "SAVE": {
      const item = state.cart.find(
        (i) => itemKey(i.id, i.variant) === action.key,
      );
      if (!item) return state;
      return {
        ...state,
        cart: state.cart.filter((i) => itemKey(i.id, i.variant) !== action.key),
        saved: normalizeItems([...state.saved, item]),
      };
    }
    case "RESTORE": {
      const item = state.saved.find(
        (i) => itemKey(i.id, i.variant) === action.key,
      );
      if (!item) return state;
      const v = getVariant(getProduct(item.id), item.variant);
      const existing =
        state.cart.find((i) => itemKey(i.id, i.variant) === action.key)
          ?.quantity || 0;
      const moved = Math.min(item.quantity, v.stock - existing);
      if (moved <= 0) return state;
      return {
        ...state,
        cart: normalizeItems([...state.cart, { ...item, quantity: moved }]),
        saved: state.saved.flatMap((i) =>
          itemKey(i.id, i.variant) !== action.key
            ? [i]
            : i.quantity > moved
              ? [{ ...i, quantity: i.quantity - moved }]
              : [],
        ),
      };
    }
    case "DELETE_SAVED":
      return {
        ...state,
        saved: state.saved.filter(
          (i) => itemKey(i.id, i.variant) !== action.key,
        ),
      };
    case "WISH":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.id)
          ? state.wishlist.filter((id) => id !== action.id)
          : getProduct(action.id)
            ? [...state.wishlist, action.id]
            : state.wishlist,
      };
    case "ORDER":
      return !state.cart.length ||
        !validOrder(action.order) ||
        state.orders.some((o) => o.id === action.order.id)
        ? state
        : {
            ...state,
            cart: [],
            orders: [cleanOrder(action.order), ...state.orders],
          };
    case "RESET":
      return emptyState();
    default:
      return state;
  }
}
export function makeOrder(
  cart,
  id = `demo-${crypto.randomUUID()}`,
  createdAt = new Date().toISOString(),
) {
  const items = normalizeItems(cart).map((i) => {
    const p = getProduct(i.id),
      v = getVariant(p, i.variant);
    return {
      id: p.id,
      title: p.title,
      variant: v.name,
      image: p.image,
      price: v.price,
      quantity: i.quantity,
    };
  });
  return {
    id,
    createdAt,
    status: "Simulated order placed",
    items,
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}
