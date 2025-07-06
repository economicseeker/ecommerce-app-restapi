const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('User Endpoints', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    // Clear dependent tables first to avoid foreign key constraint errors
    await db.query('DELETE FROM carts');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM users');
    // Register and login as regular user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'userprofile',
        email: 'userprofile@example.com',
        password: 'password123',
        first_name: 'User',
        last_name: 'Profile'
      });
    
    if (userRes.statusCode === 201) {
      userToken = userRes.body.data.token;
      userId = userRes.body.data.user.id;
    } else if (userRes.statusCode === 409) {
      // User already exists, try to login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'userprofile@example.com', password: 'password123' });
      
      if (loginRes.statusCode === 200) {
        userToken = loginRes.body.data.token;
        userId = loginRes.body.data.user.id;
      } else {
        throw new Error('Failed to login user: ' + JSON.stringify(loginRes.body));
      }
    } else {
      throw new Error('Failed to register user: ' + JSON.stringify(userRes.body));
    }

    // Register and login as admin user
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'adminprofile',
        email: 'adminprofile@example.com',
        password: 'password123',
        first_name: 'Admin',
        last_name: 'Profile'
      });
    
    if (adminRes.statusCode === 201) {
      adminToken = adminRes.body.data.token;
      adminId = adminRes.body.data.user.id;
    } else if (adminRes.statusCode === 409) {
      // User already exists, try to login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'adminprofile@example.com', password: 'password123' });
      
      if (loginRes.statusCode === 200) {
        adminToken = loginRes.body.data.token;
        adminId = loginRes.body.data.user.id;
      } else {
        throw new Error('Failed to login admin: ' + JSON.stringify(loginRes.body));
      }
    } else {
      throw new Error('Failed to register admin: ' + JSON.stringify(adminRes.body));
    }
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', 'userprofile@example.com');
    });
    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update current user profile', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ first_name: 'Updated', last_name: 'User' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('first_name', 'Updated');
    });
  });

  describe('Admin endpoints', () => {
    it('should list all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('should get any user by ID (admin only)', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('id', userId);
    });
    it('should update any user by ID (admin only)', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ first_name: 'AdminUpdated' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('first_name', 'AdminUpdated');
    });
    it('should delete a user by ID (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 204]).toContain(res.statusCode);
    });
  });

  describe('Security', () => {
    it('should not allow user to get another user profile', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([403, 401]).toContain(res.statusCode);
    });
    it('should not allow user to update another user', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ first_name: 'Hacker' });
      expect([403, 401]).toContain(res.statusCode);
    });
    it('should not allow user to delete another user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect([403, 401]).toContain(res.statusCode);
    });
  });
}); 