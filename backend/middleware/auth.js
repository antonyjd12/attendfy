const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is admin or super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super Admin only.' });
  }
  next();
};
// Add isAdmin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Check if user is HR manager or higher
const isHROrHigher = (req, res, next) => {
  const allowedRoles = ['super_admin', 'admin', 'hr_manager', 'supervisor'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'Access denied. HR Manager or higher privileges required.'
    });
  }
  next();
};

// Check if user is accessing their own data or is admin
const isSelfOrAdmin = (req, res, next) => {
  if (
    req.user.role === 'super_admin' ||
    req.user.role === 'admin' ||
    req.params.userId === req.user._id.toString()
  ) {
    return next();
  }
  res.status(403).json({
    message: 'Access denied. You can only access your own data.'
  });
};
module.exports = {
  auth,
  authorize,
  isHROrHigher,
  isSelfOrAdmin,
  isSuperAdmin,
  isAdmin  // Add isAdmin to exports
};