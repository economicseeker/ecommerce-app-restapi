import React from "react";
import "./Checkout.css";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [message, setMessage] = React.useState("");

  const total = cart.reduce(
    (sum, item) => sum + (item.price ? item.price * item.quantity : 0),
    0
  );

  const handleCheckout = () => {
    // Placeholder for Stripe/payment integration
    setMessage("Checkout complete! (Stripe integration coming soon)");
    clearCart();
  };

  if (cart.length === 0)
    return <div className="checkout-container">Your cart is empty.</div>;

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-list">
        {cart.map((item) => (
          <div className="checkout-item" key={item.id}>
            <span>{item.name}</span>
            <span>Qty: {item.quantity}</span>
            <span>${item.price} each</span>
            <span>Subtotal: ${item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="checkout-total">Total: <strong>${total.toFixed(2)}</strong></div>
      <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
      {message && <div className="checkout-message">{message}</div>}
    </div>
  );
};

export default Checkout; 