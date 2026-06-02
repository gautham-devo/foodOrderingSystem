import React, { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  emoji: string;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  placeOrder: (
    userId: string,
    grandTotal: number,
  ) => Promise<{ error: string | null }>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const increaseQty = (id: number) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );

  const decreaseQty = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.qty === 1)
        return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (userId: string, grandTotal: number) => {
    // Step 1 — validate stock
    for (const item of cart) {
      const { data } = await supabase
        .from("menu_items")
        .select("stock, is_available, name")
        .eq("id", item.id)
        .single();

      if (!data) continue;
      if (!data.is_available)
        return { error: `${data.name} is currently unavailable` };
      if (data.stock === 0) return { error: `${data.name} is sold out` };
      if (data.stock !== -1 && data.stock < item.qty)
        return { error: `Only ${data.stock} left for ${data.name}` };
    }

    // Step 2 — fetch user profile
    const { data: userData } = await supabase
      .from("profiles")
      .select("name, uid")
      .eq("id", userId)
      .single();

    const itemTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(itemTotal * 0.05);

    // Step 3 — place order
    const { data: orderData, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        user_name: userData?.name ?? "Student",
        user_uid: userData?.uid ?? "—",
        items: cart,
        item_total: itemTotal,
        delivery_fee: 30,
        tax: tax,
        grand_total: grandTotal,
        status: "paid",
      })
      .select()
      .single();

    if (error) return { error: error.message };

    // Step 4 — atomically decrement stock
    for (const item of cart) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        item_id: item.id,
        qty: item.qty,
      });

      if (stockError) {
        // Rollback order if stock ran out between validation and placement
        await supabase.from("orders").delete().eq("id", orderData.id);
        return {
          error: `${item.name} just sold out. Please update your cart.`,
        };
      }
    }

    clearCart();
    return { error: null };
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        totalItems,
        totalPrice,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
