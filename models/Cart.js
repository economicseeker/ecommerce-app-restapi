const { query } = require('../config/database');

class Cart {
  // Find or create a cart for the user
  static async findOrCreateCart(userId) {
    let result = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) return result.rows[0];
    result = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    return result.rows[0];
  }

  // Get product by ID
  static async getProduct(productId) {
    const result = await query('SELECT * FROM products WHERE id = $1', [productId]);
    return result.rows[0];
  }

  // Get cart item by cart and product
  static async getCartItem(cartId, productId) {
    const result = await query('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    return result.rows[0];
  }

  // Add or update cart item
  static async addOrUpdateCartItem(cartId, productId, quantity, price) {
    // Check if item exists
    const existing = await this.getCartItem(cartId, productId);
    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + quantity;
      const result = await query(
        'UPDATE cart_items SET quantity = $1, price_at_time = $2 WHERE id = $3 RETURNING *',
        [newQuantity, price, existing.id]
      );
      return { item: result.rows[0], updated: true };
    } else {
      // Insert new item
      const result = await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
        [cartId, productId, quantity, price]
      );
      return { item: result.rows[0], updated: false };
    }
  }

  // Check if requested quantity is available in stock
  static async checkStock(productId, requestedQuantity) {
    const product = await this.getProduct(productId);
    if (!product) return false;
    return product.stock_quantity >= requestedQuantity;
  }
}

module.exports = Cart; 