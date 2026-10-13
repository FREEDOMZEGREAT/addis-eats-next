"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "addis-eats-cart";
const EMPTY_CART = [];

function sanitizeCart(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) =>
      item &&
      item.id != null &&
      Number.isFinite(item.price) &&
      Number.isFinite(item.qty),
  );
}

function createCartStore() {
  let items = EMPTY_CART;
  let loaded = false;
  const listeners = new Set();

  function emit() {
    for (const listener of listeners) listener();
  }

  // Hydrate from localStorage once, the first time the browser subscribes.
  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    let stored = EMPTY_CART;
    try {
      stored = sanitizeCart(
        JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"),
      );
    } catch {
      stored = EMPTY_CART;
    }
    if (stored.length > 0) {
      items = stored;
      emit();
    }
  }

  function persist(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode, quota) — cart stays in memory.
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      load();
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return items;
    },
    getServerSnapshot() {
      return EMPTY_CART;
    },
    set(updater) {
      items = typeof updater === "function" ? updater(items) : updater;
      persist(items);
      emit();
    },
  };
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }) {
  const store = useMemo(() => createCartStore(), []);
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    function addToCart(dish, qty = 1) {
      store.set((prev) => {
        const found = prev.find((i) => i.id === dish.id);
        if (!found) {
          return [
            ...prev,
            {
              id: dish.id,
              name: dish.name,
              price: dish.price,
              image: dish.image,
              qty,
            },
          ];
        }
        return prev.map((i) =>
          i.id === dish.id ? { ...i, qty: i.qty + qty } : i,
        );
      });
    }

    function setQty(id, qty) {
      store.set((prev) =>
        qty <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
      );
    }

    function removeFromCart(id) {
      store.set((prev) => prev.filter((i) => i.id !== id));
    }

    function clearCart() {
      store.set([]);
    }

    // The shape the checkout server action expects.
    const orderItems = items.map(({ id, qty }) => ({ id: String(id), qty }));

    return {
      items,
      count,
      total,
      orderItems,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
    };
  }, [items, store]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
