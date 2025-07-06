const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-commerce REST API',
    status: 'Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected ? 'Database connection successful' : 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Use routes
app.use('/api/test', testRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cart', cartRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API is available at http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`🗄️ Database test at http://localhost:${PORT}/db-test`);
  
  // Test database connection on startup
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log(`✅ Database connection successful`);
    } else {
      console.log(`❌ Database connection failed`);
    }
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
  }
});

module.exports = app; 