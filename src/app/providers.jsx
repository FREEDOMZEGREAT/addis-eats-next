"use client";

import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    function addToCart(dish, qty = 1) {
      setItems((prev) => {
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
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
      );
    }

    function removeFromCart(id) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }

    function clearCart() {
      setItems([]);
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
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
