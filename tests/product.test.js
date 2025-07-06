const request = require('supertest');
const app = require('../server');

describe('Product Endpoints', () => {
  let authToken;
  let adminToken;
  let testProductId;

  // Setup: Get authentication tokens
  beforeAll(async () => {
    // Register and login as regular user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'productuser',
        email: 'productuser@example.com',
        password: 'password123',
        first_name: 'Product',
        last_name: 'User'
      });

    if (userRes.statusCode === 201) {
      authToken = userRes.body.data.token;
    } else {
      // If user exists, login instead
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'productuser@example.com',
          password: 'password123'
        });
      authToken = loginRes.body.data.token;
    }

    // Register and login as admin user
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'productadmin',
        email: 'productadmin@example.com',
        password: 'password123',
        first_name: 'Product',
        last_name: 'Admin'
      });

    if (adminRes.statusCode === 201) {
      adminToken = adminRes.body.data.token;
    } else {
      // If admin exists, login instead
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'productadmin@example.com',
          password: 'password123'
        });
      adminToken = loginRes.body.data.token;
    }
  });

  describe('GET /api/v1/products', () => {
    it('should get all products with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should get products with category filter', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ category_id: 1, page: 1, limit: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should get products with search query', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ search: 'laptop', page: 1, limit: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should get products with price range filter', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ min_price: 100, max_price: 1000, page: 1, limit: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get a specific product by ID', async () => {
      const res = await request(app)
        .get('/api/v1/products/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('id', 1);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/v1/products/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Product not found');
    });

    it('should return 400 for invalid product ID', async () => {
      const res = await request(app)
        .get('/api/v1/products/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product (admin only)', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product for TDD',
        price: 99.99,
        sku: 'TEST-001',
        stock_quantity: 50,
        category_id: 1,
        image_url: 'https://example.com/test-product.jpg'
      };

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name', 'Test Product');
      expect(res.body.data).toHaveProperty('price', 99.99);

      testProductId = res.body.data.id;
    });

    it('should return 401 for unauthorized access', async () => {
      const productData = {
        name: 'Unauthorized Product',
        description: 'This should fail',
        price: 50.00,
        sku: 'UNAUTH-001',
        stock_quantity: 10,
        category_id: 1
      };

      const res = await request(app)
        .post('/api/v1/products')
        .send(productData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid product data', async () => {
      const invalidData = {
        name: '', // Empty name
        price: -10, // Negative price
        stock_quantity: 'invalid' // Invalid stock quantity
      };

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update an existing product (admin only)', async () => {
      // First create a product to update
      const createData = {
        name: 'Product to Update',
        description: 'A product to test update functionality',
        price: 50.00,
        sku: 'UPDATE-001',
        stock_quantity: 25,
        category_id: 1,
        image_url: 'https://example.com/update-product.jpg'
      };

      const createRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createData);

      expect(createRes.statusCode).toBe(201);
      const productId = createRes.body.data.id;

      // Now update the product
      const updateData = {
        name: 'Updated Test Product',
        price: 149.99,
        stock_quantity: 75
      };

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Updated Test Product');
      expect(res.body.data).toHaveProperty('price', 149.99);
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = {
        name: 'Non-existent Product',
        price: 100.00
      };

      const res = await request(app)
        .put('/api/v1/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 401 for unauthorized access', async () => {
      const updateData = {
        name: 'Unauthorized Update',
        price: 200.00
      };

      const res = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .send(updateData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product (admin only)', async () => {
      // First create a product to delete
      const createData = {
        name: 'Product to Delete',
        description: 'A product to test delete functionality',
        price: 75.00,
        sku: 'DELETE-001',
        stock_quantity: 10,
        category_id: 1,
        image_url: 'https://example.com/delete-product.jpg'
      };

      const createRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createData);

      expect(createRes.statusCode).toBe(201);
      const productId = createRes.body.data.id;

      // Now delete the product
      const res = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .delete('/api/v1/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .delete('/api/v1/products/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/categories/:id/products', () => {
    it('should get products by category', async () => {
      const res = await request(app)
        .get('/api/v1/categories/1/products')
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('category');
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .get('/api/v1/categories/99999/products');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
}); 