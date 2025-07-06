const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('Cart Endpoints', () => {
  let userToken, userId, productId, categoryId;

  beforeAll(async () => {
    // Clear dependent tables first to avoid foreign key constraint errors
    await db.query('DELETE FROM cart_items');
    await db.query('DELETE FROM carts');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM categories');

    // Create a test user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'cartuser',
        email: 'cartuser@example.com',
        password: 'password123',
        first_name: 'Cart',
        last_name: 'User'
      });
    
    if (userRes.statusCode === 201) {
      userToken = userRes.body.data.token;
      userId = userRes.body.data.user.id;
    } else if (userRes.statusCode === 409) {
      // User already exists, try to login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'cartuser@example.com', password: 'password123' });
      
      if (loginRes.statusCode === 200) {
        userToken = loginRes.body.data.token;
        userId = loginRes.body.data.user.id;
      } else {
        throw new Error('Failed to login user: ' + JSON.stringify(loginRes.body));
      }
    } else {
      throw new Error('Failed to register user: ' + JSON.stringify(userRes.body));
    }

    // Create a test category (using direct database insertion for test setup)
    const categoryResult = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      ['Test Category', 'Test category for cart tests']
    );
    categoryId = categoryResult.rows[0].id;

    // Create a test product (using direct database insertion for test setup)
    const productResult = await db.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Test Product', 'Test product for cart tests', 29.99, 100, categoryId, 'https://example.com/test-product.jpg']
    );
    productId = productResult.rows[0].id;
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add a product to cart', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product added to cart successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.product_id).toBe(productId);
      expect(res.body.data.quantity).toBe(2);
      expect(res.body.data).toHaveProperty('created_at');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .send({
          product_id: productId,
          quantity: 1
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid product_id', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: 99999,
          quantity: 1
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should fail with invalid quantity', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 0
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with quantity exceeding stock', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Requested quantity exceeds available stock');
    });

    it('should update quantity if product already in cart', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 3
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cart item updated successfully');
      expect(res.body.data.quantity).toBe(5); // 2 + 3
    });
  });

  describe('GET /api/v1/cart', () => {
    it('should get current user cart with items', async () => {
      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('user_id');
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      
      const item = res.body.data.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('product_id');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('product');
      expect(item.product).toHaveProperty('name');
      expect(item.product).toHaveProperty('price');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/cart');

      expect(res.statusCode).toBe(401);
    });

    it('should return empty cart for new user', async () => {
      // Create a new user
      const newUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newcartuser',
          email: 'newcartuser@example.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User'
        });

      const newUserToken = newUserRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
    });
  });

  describe('PUT /api/v1/cart/items/:id', () => {
    let cartItemId;

    beforeEach(async () => {
      // Get cart to find item ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      if (cartRes.body.data.items.length > 0) {
        cartItemId = cartRes.body.data.items[0].id;
      }
    });

    it('should update cart item quantity', async () => {
      if (!cartItemId) {
        // Add item if cart is empty
        const addRes = await request(app)
          .post('/api/v1/cart/items')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            product_id: productId,
            quantity: 1
          });
        cartItemId = addRes.body.data.id;
      }

      const res = await request(app)
        .put(`/api/v1/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 4
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cart item updated successfully');
      expect(res.body.data.quantity).toBe(4);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/cart/items/${cartItemId}`)
        .send({
          quantity: 4
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid cart item ID', async () => {
      const res = await request(app)
        .put('/api/v1/cart/items/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 4
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cart item not found');
    });

    it('should fail with invalid quantity', async () => {
      const res = await request(app)
        .put(`/api/v1/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 0
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/cart/items/:id', () => {
    let cartItemId;

    beforeEach(async () => {
      // Get cart to find item ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      
      if (cartRes.body.data.items.length > 0) {
        cartItemId = cartRes.body.data.items[0].id;
      }
    });

    it('should remove item from cart', async () => {
      if (!cartItemId) {
        // Add item if cart is empty
        const addRes = await request(app)
          .post('/api/v1/cart/items')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            product_id: productId,
            quantity: 1
          });
        cartItemId = addRes.body.data.id;
      }

      const res = await request(app)
        .delete(`/api/v1/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Item removed from cart successfully');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/cart/items/${cartItemId}`);

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid cart item ID', async () => {
      const res = await request(app)
        .delete('/api/v1/cart/items/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cart item not found');
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear all items from cart', async () => {
      // First add some items
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        });

      const res = await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cart cleared successfully');

      // Verify cart is empty
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(cartRes.body.data.items).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete('/api/v1/cart');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Security', () => {
    let otherUserToken, otherUserCartItemId;

    beforeAll(async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'othercartuser',
          email: 'othercartuser@example.com',
          password: 'password123',
          first_name: 'Other',
          last_name: 'User'
        });

      if (otherUserRes.statusCode === 201) {
        otherUserToken = otherUserRes.body.data.token;
      } else if (otherUserRes.statusCode === 409) {
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'othercartuser@example.com', password: 'password123' });
        otherUserToken = loginRes.body.data.token;
      }

      // Add item to other user's cart
      const addRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });
      otherUserCartItemId = addRes.body.data.id;
    });

    it('should not allow user to access another user cart', async () => {
      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      // Should only show current user's cart items
      const hasOtherUserItem = res.body.data.items.some(item => item.id === otherUserCartItemId);
      expect(hasOtherUserItem).toBe(false);
    });

    it('should not allow user to update another user cart item', async () => {
      const res = await request(app)
        .put(`/api/v1/cart/items/${otherUserCartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 5
        });

      expect(res.statusCode).toBe(404);
    });

    it('should not allow user to delete another user cart item', async () => {
      const res = await request(app)
        .delete(`/api/v1/cart/items/${otherUserCartItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
}); 