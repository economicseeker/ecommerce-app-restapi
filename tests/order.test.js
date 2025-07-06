const request = require('supertest');
const app = require('../server');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

describe('Order Endpoints', () => {
  let testUser, testUser2, testProduct1, testProduct2, testOrder, testOrder2;
  let userToken, user2Token;

  beforeAll(async () => {
    // Use unique usernames/emails for each run
    const unique = Date.now();
    const username1 = `testuser_${unique}`;
    const username2 = `testuser2_${unique}`;
    const email1 = `testuser_${unique}@example.com`;
    const email2 = `testuser2_${unique}@example.com`;
    // Create test users
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const userResult = await db.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username1, email1, hashedPassword, 'Test', 'User', false]
    );
    testUser = userResult.rows[0];

    const user2Result = await db.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username2, email2, hashedPassword, 'Test', 'User2', false]
    );
    testUser2 = user2Result.rows[0];

    // Create test categories
    const category1Result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      ['Electronics', 'Electronic devices and accessories']
    );
    const category1 = category1Result.rows[0];

    const category2Result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      ['Books', 'Books and publications']
    );
    const category2 = category2Result.rows[0];

    // Create test products
    const product1Result = await db.query(
      'INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['Test Product 1', 'Test Description 1', 29.99, category1.id, 100]
    );
    testProduct1 = product1Result.rows[0];

    const product2Result = await db.query(
      'INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['Test Product 2', 'Test Description 2', 49.99, category2.id, 50]
    );
    testProduct2 = product2Result.rows[0];

    // Create test orders
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, status, order_number, shipping_address, billing_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [testUser.id, 79.98, 'completed', 'ORD-001', '123 Test St, Test City, TS 12345', '123 Test St, Test City, TS 12345']
    );
    testOrder = orderResult.rows[0];

    const order2Result = await db.query(
      'INSERT INTO orders (user_id, total_amount, status, order_number, shipping_address, billing_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [testUser.id, 29.99, 'pending', 'ORD-002', '123 Test St, Test City, TS 12345', '123 Test St, Test City, TS 12345']
    );
    testOrder2 = order2Result.rows[0];

    // Create order items
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
      [testOrder.id, testProduct1.id, 1, 29.99]
    );
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
      [testOrder.id, testProduct2.id, 1, 49.99]
    );
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
      [testOrder2.id, testProduct1.id, 1, 29.99]
    );

    // Get authentication tokens
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: email1,
        password: 'testpassword123'
      });
    userToken = loginResponse.body.data.token;

    const login2Response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: email2,
        password: 'testpassword123'
      });
    user2Token = login2Response.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM order_items WHERE order_id IN ($1, $2)', [testOrder.id, testOrder2.id]);
    await db.query('DELETE FROM orders WHERE id IN ($1, $2)', [testOrder.id, testOrder2.id]);
    await db.query('DELETE FROM products WHERE category_id IN (SELECT id FROM categories WHERE name IN ($1, $2))', ['Electronics', 'Books']);
    await db.query('DELETE FROM users WHERE id IN ($1, $2)', [testUser.id, testUser2.id]);
    await db.query('DELETE FROM categories WHERE name IN ($1, $2)', ['Electronics', 'Books']);
  });

  describe('GET /api/orders', () => {
    it('should return all orders for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBe(2);

      // Check order structure
      const order = response.body.orders.find(o => o.id === testOrder.id);
      expect(order).toBeDefined();
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('user_id', testUser.id);
      expect(order).toHaveProperty('total_amount', '79.98');
      expect(order).toHaveProperty('status', 'completed');
      expect(order).toHaveProperty('order_number', 'ORD-001');
      expect(order).toHaveProperty('created_at');
      expect(order).toHaveProperty('updated_at');
    });

    it('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBe(0);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/v1/orders');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should return order details with items for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('order');
      
      const order = response.body.order;
      expect(order).toHaveProperty('id', testOrder.id);
      expect(order).toHaveProperty('user_id', testUser.id);
      expect(order).toHaveProperty('total_amount', '79.98');
      expect(order).toHaveProperty('status', 'completed');
      expect(order).toHaveProperty('order_number', 'ORD-001');
      expect(order).toHaveProperty('created_at');
      expect(order).toHaveProperty('updated_at');
      expect(order).toHaveProperty('items');
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBe(2);

      // Check order items
      const item1 = order.items.find(item => item.product_id === testProduct1.id);
      expect(item1).toBeDefined();
      expect(item1).toHaveProperty('id');
      expect(item1).toHaveProperty('product_id', testProduct1.id);
      expect(item1).toHaveProperty('quantity', 1);
      expect(item1).toHaveProperty('price_at_time', 29.99);
      expect(item1).toHaveProperty('product');
      expect(item1.product).toHaveProperty('name', 'Test Product 1');
      expect(item1.product).toHaveProperty('description', 'Test Description 1');
      expect(item1.product).toHaveProperty('price', 29.99);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/v1/orders/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Order not found');
    });

    it('should return 403 for accessing another user\'s order', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Order not found');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return 400 for invalid order ID format', async () => {
      const response = await request(app)
        .get('/api/v1/orders/invalid-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid order ID');
    });
  });
});