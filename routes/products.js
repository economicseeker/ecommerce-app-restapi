const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProducts,
  validateGetProduct,
  validateDeleteProduct,
  validateGetProductsByCategory
} = require('../middleware/productValidation');

const router = express.Router();

// Get all products with filtering, search, and pagination
router.get('/', validateGetProducts, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      search,
      min_price,
      max_price
    } = req.query;

    const offset = (page - 1) * limit;
    let products = [];
    let totalCount = 0;

    // Build query based on filters
    if (search) {
      // Search products by name or description
      products = await Product.search(search, parseInt(limit));
      totalCount = products.length;
    } else if (category_id) {
      // Get products by category
      products = await Product.getByCategory(parseInt(category_id), parseInt(limit));
      totalCount = products.length;
    } else {
      // Get all products with pagination
      products = await Product.getAll(null, parseInt(limit), offset);
      
      // Get total count for pagination
      const countResult = await Product.query('SELECT COUNT(*) as total FROM products WHERE is_active = true');
      totalCount = parseInt(countResult.rows[0].total);
    }

    // Apply price filters if provided
    if (min_price || max_price) {
      products = products.filter(product => {
        const price = parseFloat(product.price);
        const min = min_price ? parseFloat(min_price) : 0;
        const max = max_price ? parseFloat(max_price) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: 'Internal server error'
    });
  }
});

// Get a specific product by ID
router.get('/:id', validateGetProduct, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: 'Internal server error'
    });
  }
});

// Create a new product (admin only)
router.post('/', authenticateToken, validateCreateProduct, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      sku,
      stock_quantity,
      category_id,
      image_url
    } = req.body;

    // Check if SKU already exists
    const existingSku = await Product.skuExists(sku);
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists',
        error: 'A product with this SKU already exists'
      });
    }

    // Verify category exists
    const category = await Category.getById(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        error: 'Category does not exist'
      });
    }

    // Create product
    const productData = {
      name,
      description,
      price: parseFloat(price),
      sku,
      stock_quantity: parseInt(stock_quantity),
      category_id: parseInt(category_id),
      image_url
    };

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: 'Internal server error'
    });
  }
});

// Update a product (admin only)
router.put('/:id', authenticateToken, validateUpdateProduct, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU already exists (if updating SKU)
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await Product.skuExists(updateData.sku, productId);
      if (skuExists) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists',
          error: 'A product with this SKU already exists'
        });
      }
    }

    // Verify category exists (if updating category)
    if (updateData.category_id) {
      const category = await Category.getById(updateData.category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category',
          error: 'Category does not exist'
        });
      }
    }

    // Update product
    const updatedProduct = await Product.update(productId, updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: 'Internal server error'
    });
  }
});

// Delete a product (admin only)
router.delete('/:id', authenticateToken, validateDeleteProduct, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Check if product exists
    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete product
    await Product.delete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: 'Internal server error'
    });
  }
});

module.exports = router; 