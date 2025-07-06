const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { validateGetProductsByCategory } = require('../middleware/productValidation');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: 'Internal server error'
    });
  }
});

// Get products by category
router.get('/:id/products', validateGetProductsByCategory, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if category exists
    const category = await Category.getById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products by category
    const products = await Product.getByCategory(categoryId, parseInt(limit));
    
    // Get total count for pagination
    const countResult = await Product.query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = $1 AND is_active = true',
      [categoryId]
    );
    const totalCount = parseInt(countResult.rows[0].total);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          description: category.description
        },
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalCount,
          items_per_page: parseInt(limit),
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products by category',
      error: 'Internal server error'
    });
  }
});

module.exports = router; 