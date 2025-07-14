import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.css";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/v1/products/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product || data); // support both {product:{}} and {}
      } catch (err) {
        setError(err.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      setCartMessage("Added to cart!");
    }
  };

  if (loading) return <div className="product-details-container">Loading product...</div>;
  if (error) return <div className="product-details-container error-message">{error}</div>;
  if (!product) return <div className="product-details-container">Product not found.</div>;

  return (
    <div className="product-details-container">
      {product.image_url && (
        <img src={product.image_url} alt={product.name} />
      )}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {product.price && <p><strong>Price:</strong> ${product.price}</p>}
      <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
      {cartMessage && <div className="cart-message">{cartMessage}</div>}
    </div>
  );
};

export default ProductDetails; 