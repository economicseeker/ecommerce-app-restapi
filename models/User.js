const { query } = require('../config/database');

class User {
  // Get all users
  static async getAll() {
    const result = await query('SELECT id, username, email, first_name, last_name, is_active, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  // Get user by ID
  static async getById(id) {
    const result = await query('SELECT id, username, email, first_name, last_name, phone, address, city, state, zip_code, country, is_active, created_at, updated_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Get user by email
  static async getByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  // Get user by username
  static async getByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  // Create new user
  static async create(userData) {
    const { username, email, password_hash, first_name, last_name, phone, address, city, state, zip_code, country } = userData;
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, city, state, zip_code, country) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id, username, email, first_name, last_name, created_at`,
      [username, email, password_hash, first_name, last_name, phone, address, city, state, zip_code, country]
    );
    
    return result.rows[0];
  }

  // Update user
  static async update(id, userData) {
    const { first_name, last_name, phone, address, city, state, zip_code, country } = userData;
    
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, state = $6, zip_code = $7, country = $8, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 
       RETURNING id, username, email, first_name, last_name, updated_at`,
      [first_name, last_name, phone, address, city, state, zip_code, country, id]
    );
    
    return result.rows[0];
  }

  // Delete user (soft delete by setting is_active to false)
  static async delete(id) {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Check if email exists
  static async emailExists(email) {
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  // Check if username exists
  static async usernameExists(username) {
    const result = await query('SELECT id FROM users WHERE username = $1', [username]);
    return result.rows.length > 0;
  }
}

module.exports = User; 