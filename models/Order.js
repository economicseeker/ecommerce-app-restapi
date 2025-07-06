const { query } = require('../config/database');

class Order {
  // Generate order number
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  // Create a new order
  static async createOrder(userId, totalAmount, status = 'pending', billingAddress, shippingAddress) {
    const orderNumber = this.generateOrderNumber();
    const result = await query(`
      INSERT INTO orders (user_id, order_number, total_amount, status, billing_address, shipping_address) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [userId, orderNumber, totalAmount, status, JSON.stringify(billingAddress), JSON.stringify(shippingAddress)]);
    
    return result.rows[0];
  }

  // Add order items
  static async addOrderItems(orderId, items) {
    const orderItems = [];
    
    for (const item of items) {
      const result = await query(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [orderId, item.product_id, item.quantity, item.price_at_time]);
      
      orderItems.push(result.rows[0]);
    }
    
    return orderItems;
  }

  // Get order by ID with items
  static async getOrderById(orderId, userId = null) {
    let sql = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'product', json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'description', p.description,
                   'image_url', p.image_url,
                   'price', oi.price_at_time
                 )
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
    `;
    
    const params = [orderId];
    
    if (userId) {
      sql += ' AND o.user_id = $2';
      params.push(userId);
    }
    
    sql += ' GROUP BY o.id';
    
    const result = await query(sql, params);
    return result.rows[0];
  }

  // Get user's orders
  static async getUserOrders(userId, limit = 10, offset = 0) {
    const result = await query(`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'product', json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'description', p.description,
                   'image_url', p.image_url,
                   'price', oi.price_at_time
                 )
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    return result.rows;
  }

  // Update order status
  static async updateOrderStatus(orderId, status) {
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return result.rows[0];
  }

  // Calculate total amount from cart items
  static calculateTotalAmount(items) {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.price_at_time) * item.quantity);
    }, 0);
  }
}

module.exports = Order; 