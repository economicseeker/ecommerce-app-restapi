import React, { useEffect, useState } from "react";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/v1/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.products || data); // support both {products:[]} and []
      } catch (err) {
        setError(err.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="products-container">Loading products...</div>;
  if (error) return <div className="products-container error-message">{error}</div>;

  return (
    <div className="products-container">
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image_url && (
              <img src={product.image_url} alt={product.name} />
            )}
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Products; 