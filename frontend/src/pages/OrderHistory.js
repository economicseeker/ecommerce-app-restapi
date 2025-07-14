import React, { useEffect, useState } from "react";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/v1/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || data); // support both {orders:[]} and []
      } catch (err) {
        setError(err.message || "Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="order-history-container">Loading orders...</div>;
  if (error) return <div className="order-history-container error-message">{error}</div>;

  return (
    <div className="order-history-container">
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        orders.map((order) => (
          <div className="order-item" key={order.id}>
            <div><strong>Order ID:</strong> {order.id}</div>
            <div><strong>Status:</strong> {order.status}</div>
            <div><strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</div>
            <div><strong>Items:</strong>
              <ul>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} x{item.quantity} (${item.price} each)
                    </li>
                  ))
                ) : (
                  <li>No items</li>
                )}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory; 