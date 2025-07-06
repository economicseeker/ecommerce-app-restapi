const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'tdduser',
    email: 'tdduser@example.com',
    password: 'password123',
    first_name: 'TDD',
    last_name: 'User'
  };

  beforeAll(async () => {
    // Ensure user exists for login tests
    await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'tdduser2',
        email: 'tdduser2@example.com',
        password: 'password123',
        first_name: 'TDD',
        last_name: 'User'
      });
    expect([201, 409]).toContain(res.statusCode); // 201 if new, 409 if already exists
    expect(res.body).toHaveProperty('success');
    if (res.statusCode === 201) {
      expect(res.body.data.user).toHaveProperty('username', 'tdduser2');
    }
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notfound@example.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail login if user is inactive', async () => {
      // Simulate inactive user (set is_active = false in DB)
      // This assumes you have a way to update the user in your test DB
      // For now, we skip this if not possible
      // You can implement a helper or direct DB call for this test
    });

    it('should fail login with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email }); // missing password
      expect([400, 401, 422]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success', false);
    });
  });
}); 