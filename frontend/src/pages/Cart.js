import React from "react";
import "./Cart.css";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, removeFromCart, loading, error } = useCart();

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  if (loading) return <div className="cart-container">Loading cart...</div>;
  if (error) return <div className="cart-container error-message">{error}</div>;
  if (!cart.items.length) return <div className="cart-container">Your cart is empty.</div>;

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart.items.map((item) => (
        <div className="cart-item" key={item.id}>
          <span>{item.product.name}</span>
          <span>Qty: {item.quantity}</span>
          <span>${item.product.price} each</span>
          <span>Subtotal: ${item.product.price * item.quantity}</span>
          <button className="remove-btn" onClick={() => removeFromCart(item.id)} disabled={loading}>Remove</button>
        </div>
      ))}
      <div className="cart-summary">Total: <strong>${total.toFixed(2)}</strong></div>
    </div>
  );
};

export default Cart; 