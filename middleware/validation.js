// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  const { username, email, password, first_name, last_name } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username && username.length > 50) {
    errors.push('Username must be less than 50 characters');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password && password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Name validation
  if (!first_name || first_name.trim().length < 1) {
    errors.push('First name is required');
  }

  if (!last_name || last_name.trim().length < 1) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || !password.trim()) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for user profile update
const validateProfileUpdate = (req, res, next) => {
  const { first_name, last_name, phone, address, city, state, zip_code, country } = req.body;
  const errors = [];

  if (first_name && first_name.trim().length < 1) {
    errors.push('First name cannot be empty');
  }

  if (last_name && last_name.trim().length < 1) {
    errors.push('Last name cannot be empty');
  }

  if (phone && phone.length > 20) {
    errors.push('Phone number must be less than 20 characters');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for product creation/update
const validateProduct = (req, res, next) => {
  const { name, price, category_id, sku, stock_quantity } = req.body;
  const errors = [];

  if (!name || name.trim().length < 1) {
    errors.push('Product name is required');
  }

  if (name && name.length > 200) {
    errors.push('Product name must be less than 200 characters');
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    errors.push('Price must be a positive number');
  }

  if (category_id !== undefined && (isNaN(category_id) || category_id < 1)) {
    errors.push('Valid category ID is required');
  }

  if (sku && sku.length > 100) {
    errors.push('SKU must be less than 100 characters');
  }

  if (stock_quantity !== undefined && (isNaN(stock_quantity) || stock_quantity < 0)) {
    errors.push('Stock quantity must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for cart operations
const validateCartItem = (req, res, next) => {
  const { product_id, quantity } = req.body;
  const errors = [];

  if (!product_id || isNaN(product_id) || product_id < 1) {
    errors.push('Valid product ID is required');
  }

  if (!quantity || isNaN(quantity) || quantity < 1) {
    errors.push('Quantity must be a positive number');
  }

  if (quantity && quantity > 1000) {
    errors.push('Quantity cannot exceed 1000');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for order creation
const validateOrder = (req, res, next) => {
  const { shipping_address, billing_address } = req.body;
  const errors = [];

  if (!shipping_address || shipping_address.trim().length < 10) {
    errors.push('Shipping address must be at least 10 characters long');
  }

  if (!billing_address || billing_address.trim().length < 10) {
    errors.push('Billing address must be at least 10 characters long');
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateProduct,
  validateCartItem,
  validateOrder
}; 