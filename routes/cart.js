const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { query } = require('../config/database');

const router = express.Router();

// Add item to cart
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product_id or quantity' });
    }

    // Check product exists
    const product = await Cart.getProduct(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (quantity > product.stock_quantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }

    // Find or create cart
    const cart = await Cart.findOrCreateCart(userId);

    // Add or update cart item
    const existingItem = await Cart.getCartItem(cart.id, product_id);
    let totalQuantity = quantity;
    if (existingItem) {
      totalQuantity = existingItem.quantity + quantity;
      if (totalQuantity > product.stock_quantity) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      }
    }
    const { item, updated } = await Cart.addOrUpdateCartItem(cart.id, product_id, quantity, product.price);

    if (updated) {
      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: item
      });
    } else {
      return res.status(201).json({
        success: true,
        message: 'Product added to cart successfully',
        data: item
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to cart', error: 'Internal server error' });
  }
});

// Get current user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find or create cart
    const cart = await Cart.findOrCreateCart(userId);

    // Get cart items with product details
    const result = await query(`
      SELECT 
        ci.id,
        ci.quantity,
        ci.price_at_time,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.image_url as product_image,
        p.stock_quantity as product_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `, [cart.id]);

    const items = result.rows.map(item => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      product: {
        id: item.product_id,
        name: item.product_name,
        description: item.product_description,
        image_url: item.product_image,
        price: item.price_at_time,
        stock_quantity: item.product_stock
      }
    }));

    res.json({
      success: true,
      data: {
        id: cart.id,
        user_id: cart.user_id,
        items: items,
        total_items: items.length,
        created_at: cart.created_at,
        updated_at: cart.updated_at
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to get cart', error: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    // Find user's cart
    const cart = await Cart.findOrCreateCart(userId);
    // Get cart item and check ownership
    const itemResult = await query('SELECT * FROM cart_items WHERE id = $1 AND cart_id = $2', [cartItemId, cart.id]);
    const cartItem = itemResult.rows[0];
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    // Get product and check stock
    const product = await Cart.getProduct(cartItem.product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (quantity > product.stock_quantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }
    // Update cart item
    const updateResult = await query(
      'UPDATE cart_items SET quantity = $1, price_at_time = $2 WHERE id = $3 RETURNING *',
      [quantity, product.price, cartItemId]
    );
    const updatedItem = updateResult.rows[0];
    // Return with product details
    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        id: updatedItem.id,
        product_id: updatedItem.product_id,
        quantity: updatedItem.quantity,
        price_at_time: updatedItem.price_at_time,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity
        }
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart item', error: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItemId = parseInt(req.params.id, 10);
    // Find user's cart
    const cart = await Cart.findOrCreateCart(userId);
    // Get cart item and check ownership
    const itemResult = await query('SELECT * FROM cart_items WHERE id = $1 AND cart_id = $2', [cartItemId, cart.id]);
    const cartItem = itemResult.rows[0];
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    // Delete cart item
    await query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
    res.json({ success: true, message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove cart item', error: 'Internal server error' });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Find user's cart
    const cart = await Cart.findOrCreateCart(userId);
    // Delete all items in the cart
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart', error: 'Internal server error' });
  }
});

// Checkout cart
router.post('/:cartId/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartId = parseInt(req.params.cartId, 10);
    const { payment_method, card_number, expiry_month, expiry_year, cvv, billing_address, shipping_address } = req.body;

    // Validate cart exists and belongs to user
    const cart = await query('SELECT * FROM carts WHERE id = $1 AND user_id = $2', [cartId, userId]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Get cart items
    const cartItemsResult = await query(`
      SELECT ci.*, p.name as product_name, p.description as product_description, p.image_url as product_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    if (cartItemsResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate payment details
    if (!payment_method || !card_number || !expiry_month || !expiry_year || !cvv) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    // Basic payment validation (simplified for development)
    if (!/^\d{16}$/.test(card_number.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid payment details: Invalid card number' });
    }

    const month = parseInt(expiry_month, 10);
    const year = parseInt(expiry_year, 10);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid payment details: Invalid expiry month' });
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return res.status(400).json({ success: false, message: 'Invalid payment details: Card expired' });
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({ success: false, message: 'Invalid payment details: Invalid CVV' });
    }

    // Simulate payment processing (assume success for development)
    // In production, this would integrate with a payment processor like Stripe
    
    // Calculate total amount
    const totalAmount = Order.calculateTotalAmount(cartItemsResult.rows);

    // Create order
    const order = await Order.createOrder(
      userId,
      totalAmount,
      'pending',
      billing_address || {},
      shipping_address || billing_address || {}
    );

    // Add order items
    await Order.addOrderItems(order.id, cartItemsResult.rows);

    // Clear cart
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        items_count: cartItemsResult.rows.length
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to process checkout', error: 'Internal server error' });
  }
});

module.exports = router; 