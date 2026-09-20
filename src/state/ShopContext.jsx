import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react";
import { getProduct, getVariant } from "../data/products.js";
import {
  shopReducer,
  readStorage,
  STORAGE_KEY,
  itemKey,
  emptyState,
} from "./shop.js";
const ShopContext = createContext(null);
export function ShopProvider({ children }) {
  const [initial] = useState(() => {
    try {
      return readStorage(window.localStorage);
    } catch {
      return {
        state: emptyState(),
        warning:
          "Browser storage is unavailable. Shopping works for this session only.",
      };
    }
  });
  const [state, dispatch] = useReducer(shopReducer, initial.state);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setWarning(
        "Browser storage is unavailable. You can keep shopping, but this session will not be saved.",
      );
    }
  }, [state]);
  const notify = useCallback((text) => setNotice({ text, id: Date.now() }), []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function add(id, variant, quantity = 1) {
    const p = getProduct(id),
      v = getVariant(p, variant);
    if (!v || !Number.isInteger(quantity) || quantity < 1) return false;
    const existing =
      state.cart.find((i) => itemKey(i.id, i.variant) === itemKey(id, variant))
        ?.quantity || 0;
    if (existing >= v.stock) {
      notify("Stock limit reached for this option.");
      return false;
    }
    dispatch({ type: "ADD", item: { id, variant, quantity } });
    notify(
      `${Math.min(quantity, v.stock - existing)} added to your cart${quantity > v.stock - existing ? " — stock limit applied" : ""}.`,
    );
    return true;
  }
  function wish(id) {
    notify(
      state.wishlist.includes(id)
        ? "Removed from your wishlist."
        : "Saved to your wishlist.",
    );
    dispatch({ type: "WISH", id });
  }
  return (
    <ShopContext.Provider
      value={{ state, dispatch, warning, notice, notify, add, wish }}
    >
      {children}
    </ShopContext.Provider>
  );
}
export function useShop() {
  return useContext(ShopContext);
}
