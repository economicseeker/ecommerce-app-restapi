const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// GET /orders - Get current user's order history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get user's orders
    const orders = await Order.getUserOrders(userId, parseInt(limit), offset);
    
    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: 'Internal server error'
    });
  }
});

// GET /orders/:orderId - Get specific order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    
    // Validate order ID format
    if (!Number.isInteger(parseInt(orderId)) || parseInt(orderId) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    // Get order with items, restricted to current user
    const order = await Order.getOrderById(parseInt(orderId), userId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: 'Internal server error'
    });
  }
});

module.exports = router; 