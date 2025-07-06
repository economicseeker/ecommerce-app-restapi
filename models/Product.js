const { query } = require('../config/database');

class Product {
  // Static query method for direct database access
  static async query(sql, params = []) {
    return await query(sql, params);
  }
  // Get all products with optional category filter
  static async getAll(categoryId = null, limit = 50, offset = 0) {
    let sql = `
      SELECT p.id, p.name, p.description, p.price, p.sku, p.stock_quantity, p.image_url, p.is_active, p.created_at,
             c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    
    const params = [];
    
    if (categoryId) {
      sql += ' AND p.category_id = $1';
      params.push(categoryId);
    }
    
    sql += ' ORDER BY p.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get product by ID
  static async getById(id) {
    const result = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  }

  // Get product by SKU
  static async getBySku(sku) {
    const result = await query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0];
  }

  // Create new product
  static async create(productData) {
    const { name, description, price, category_id, sku, stock_quantity, image_url } = productData;
    
    const result = await query(
      `INSERT INTO products (name, description, price, category_id, sku, stock_quantity, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, price, category_id, sku, stock_quantity, image_url]
    );
    
    // Convert price to number for consistent response
    const product = result.rows[0];
    if (product) {
      product.price = parseFloat(product.price);
    }
    
    return product;
  }

  // Update product
  static async update(id, productData) {
    const { name, description, price, category_id, sku, stock_quantity, image_url } = productData;
    
    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category_id = $4, sku = $5, stock_quantity = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING *`,
      [name, description, price, category_id, sku, stock_quantity, image_url, id]
    );
    
    // Convert price to number for consistent response
    const product = result.rows[0];
    if (product) {
      product.price = parseFloat(product.price);
    }
    
    return product;
  }

  // Delete product (soft delete by setting is_active to false)
  static async delete(id) {
    const result = await query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Update stock quantity
  static async updateStock(id, quantity) {
    const result = await query(
      'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, stock_quantity',
      [quantity, id]
    );
    return result.rows[0];
  }

  // Search products by name or description
  static async search(searchTerm, limit = 20) {
    const result = await query(`
      SELECT p.id, p.name, p.description, p.price, p.sku, p.stock_quantity, p.image_url, p.is_active,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true 
        AND (p.name ILIKE $1 OR p.description ILIKE $1)
      ORDER BY p.name
      LIMIT $2
    `, [`%${searchTerm}%`, limit]);
    
    return result.rows;
  }

  // Get products by category
  static async getByCategory(categoryId, limit = 20) {
    const result = await query(`
      SELECT p.id, p.name, p.description, p.price, p.sku, p.stock_quantity, p.image_url, p.is_active,
             c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.category_id = $1
      ORDER BY p.name
      LIMIT $2
    `, [categoryId, limit]);
    
    return result.rows;
  }

  // Check if SKU exists
  static async skuExists(sku, excludeId = null) {
    let sql = 'SELECT id FROM products WHERE sku = $1';
    const params = [sku];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}

module.exports = Product; 