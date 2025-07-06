const { query } = require('../config/database');

class Category {
  // Get all categories
  static async getAll() {
    const result = await query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM categories 
      WHERE is_active = true
      ORDER BY name
    `);
    return result.rows;
  }

  // Get category by ID
  static async getById(id) {
    const result = await query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM categories 
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  // Get category by name
  static async getByName(name) {
    const result = await query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM categories 
      WHERE name = $1 AND is_active = true
    `, [name]);
    return result.rows[0];
  }

  // Create new category
  static async create(categoryData) {
    const { name, description } = categoryData;
    
    const result = await query(
      `INSERT INTO categories (name, description) 
       VALUES ($1, $2) 
       RETURNING id, name, description, is_active, created_at, updated_at`,
      [name, description]
    );
    
    return result.rows[0];
  }

  // Update category
  static async update(id, categoryData) {
    const { name, description } = categoryData;
    
    const result = await query(
      `UPDATE categories 
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, description, is_active, created_at, updated_at`,
      [name, description, id]
    );
    
    return result.rows[0];
  }

  // Delete category (soft delete by setting is_active to false)
  static async delete(id) {
    const result = await query(
      'UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Check if category name exists
  static async nameExists(name, excludeId = null) {
    let sql = 'SELECT id FROM categories WHERE name = $1';
    const params = [name];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}

module.exports = Category; 