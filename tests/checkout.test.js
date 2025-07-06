const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('Checkout Endpoints', () => {
  let userToken, userId, cartId, productId, categoryId;

  beforeAll(async () => {
    // Clear dependent tables first to avoid foreign key constraint errors
    await db.query('DELETE FROM order_items');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM cart_items');
    await db.query('DELETE FROM carts');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM categories');

    // Create a test user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'checkoutuser',
        email: 'checkoutuser@example.com',
        password: 'password123',
        first_name: 'Checkout',
        last_name: 'User'
      });
    
    if (userRes.statusCode === 201) {
      userToken = userRes.body.data.token;
      userId = userRes.body.data.user.id;
    } else {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'checkoutuser@example.com', password: 'password123' });
      userToken = loginRes.body.data.token;
      userId = loginRes.body.data.user.id;
    }

    // Create a test category
    const categoryResult = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      ['Test Category', 'Test category for checkout tests']
    );
    categoryId = categoryResult.rows[0].id;

    // Create a test product
    const productResult = await db.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      ['Test Product', 'Test product for checkout tests', 29.99, 100, categoryId, 'https://example.com/test-product.jpg']
    );
    productId = productResult.rows[0].id;

    // Add product to cart
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        product_id: productId,
        quantity: 2
      });

    // Get cart ID
    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${userToken}`);
    cartId = cartRes.body.data.id;
  });

  describe('POST /api/v1/cart/:cartId/checkout', () => {
    it('should successfully checkout cart with valid payment details', async () => {
      // Add item to cart first (since cart might be empty from previous tests)
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 2
        });

      // Get updated cart ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      const currentCartId = cartRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/cart/${currentCartId}/checkout`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123',
          billing_address: {
            first_name: 'Checkout',
            last_name: 'User',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            country: 'US'
          },
          shipping_address: {
            first_name: 'Checkout',
            last_name: 'User',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            country: 'US'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order created successfully');
      expect(res.body.data).toHaveProperty('order_id');
      expect(res.body.data).toHaveProperty('total_amount');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data.status).toBe('pending');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post(`/api/v1/cart/${cartId}/checkout`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid cart ID', async () => {
      const res = await request(app)
        .post('/api/v1/cart/99999/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cart not found');
    });

    it('should fail with empty cart', async () => {
      // Create a new user with empty cart
      const newUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'emptycartuser',
          email: 'emptycartuser@example.com',
          password: 'password123',
          first_name: 'Empty',
          last_name: 'Cart'
        });
      
      const newUserToken = newUserRes.body.data.token;
      const newCartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${newUserToken}`);
      const newCartId = newCartRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/cart/${newCartId}/checkout`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cart is empty');
    });

    it('should fail with invalid payment details', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });

      // Get updated cart ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      const currentCartId = cartRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/cart/${currentCartId}/checkout`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: 'invalid',
          expiry_month: '13', // Invalid month
          expiry_year: '2020', // Past year
          cvv: '12' // Too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid payment details');
    });

    it('should fail when user tries to checkout another user cart', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'otheruser',
          email: 'otheruser@example.com',
          password: 'password123',
          first_name: 'Other',
          last_name: 'User'
        });
      
      const otherUserToken = otherUserRes.body.data.token;

      // Create a fresh cart for the original user with items
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });

      // Get the cart ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      const currentCartId = cartRes.body.data.id;

      // Verify the cart exists and has items
      expect(cartRes.body.data.items.length).toBeGreaterThan(0);

      // Try to checkout with the other user's token
      const res = await request(app)
        .post(`/api/v1/cart/${currentCartId}/checkout`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123'
        });

      // Since the cart belongs to the first user, the second user should get 404 (cart not found for them)
      // This is actually the correct behavior - the cart doesn't exist for the second user
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cart not found');
    });

    it('should fail with missing required payment fields', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });

      // Get updated cart ID
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);
      const currentCartId = cartRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/cart/${currentCartId}/checkout`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'credit_card'
          // Missing card_number, expiry_month, etc.
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Missing required payment fields');
    });

    it('should clear cart after successful checkout', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          quantity: 1
        });

      // Checkout
      await request(app)
        .post(`/api/v1/cart/${cartId}/checkout`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'credit_card',
          card_number: '4242424242424242',
          expiry_month: '12',
          expiry_year: '2025',
          cvv: '123',
          billing_address: {
            first_name: 'Checkout',
            last_name: 'User',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip_code: '12345',
            country: 'US'
          }
        });

      // Verify cart is empty
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(cartRes.body.data.items).toEqual([]);
      expect(cartRes.body.data.total_items).toBe(0);
    });
  });
}); 