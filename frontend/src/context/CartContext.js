import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ id: null, items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!token) {
      setCart({ id: null, items: [] });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart({ id: data.data.id, items: data.data.items });
    } catch (err) {
      setError(err.message || "Error fetching cart");
      setCart({ id: null, items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [token]);

  // Add to cart (backend)
  const addToCart = async (product, quantity = 1) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      await fetchCart();
    } catch (err) {
      setError(err.message || "Error adding to cart");
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart (backend)
  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove from cart");
      await fetchCart();
    } catch (err) {
      setError(err.message || "Error removing from cart");
    } finally {
      setLoading(false);
    }
  };

  // Clear cart (backend)
  const clearCart = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      await fetchCart();
    } catch (err) {
      setError(err.message || "Error clearing cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, fetchCart, loading, error }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 