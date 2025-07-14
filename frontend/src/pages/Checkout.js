import React, { useState } from "react";
import "./Checkout.css";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, clearCart, loading } = useCart();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const handleCheckout = async () => {
    setMessage("");
    setError("");
    setProcessing(true);
    try {
      // Dummy payment/address info for demo
      const res = await fetch(`/api/v1/cart/${cart.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: "card",
          card_number: "4242424242424242",
          expiry_month: "12",
          expiry_year: "2030",
          cvv: "123",
          billing_address: "123 Main St, City, Country",
          shipping_address: "123 Main St, City, Country"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");
      setMessage("Checkout complete! Order created.");
      await clearCart();
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="checkout-container">Loading cart...</div>;
  if (!cart.items.length) return <div className="checkout-container">Your cart is empty.</div>;

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-list">
        {cart.items.map((item) => (
          <div className="checkout-item" key={item.id}>
            <span>{item.product.name}</span>
            <span>Qty: {item.quantity}</span>
            <span>${item.product.price} each</span>
            <span>Subtotal: ${item.product.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="checkout-total">Total: <strong>${total.toFixed(2)}</strong></div>
      <button className="checkout-btn" onClick={handleCheckout} disabled={processing}>
        {processing ? "Processing..." : "Checkout"}
      </button>
      {message && <div className="checkout-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Checkout; 