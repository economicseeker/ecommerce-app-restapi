const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'No token provided'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Token verification failed'
      });
    }
    req.user = user;
    next();
  });
};

// Authorization middleware - check if user can access/modify specific user data
const authorizeUserAccess = (req, res, next) => {
  const requestedUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;

  // Users can only access their own data (unless they're admin)
  if (requestedUserId !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      error: 'You can only access your own user data'
    });
  }

  next();
};

// Admin authorization middleware (placeholder for future role-based access)
const requireAdmin = (req, res, next) => {
  // TODO: Implement proper role-based authorization
  // For now, we'll allow any authenticated user to access admin functions
  // In a real app, you'd check if req.user.role === 'admin'
  next();
};

module.exports = {
  authenticateToken,
  authorizeUserAccess,
  requireAdmin
}; 