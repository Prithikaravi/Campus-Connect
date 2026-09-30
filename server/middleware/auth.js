const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');

const getUserFromHeader = async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (e) {
    throw fail(res, 401, 'Session expired or invalid. Please log in again.');
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw fail(res, 401, 'Account not found or disabled.');
  return user;
};

// Requires a valid token
exports.protect = asyncHandler(async (req, res, next) => {
  const user = await getUserFromHeader(req, res);
  if (!user) throw fail(res, 401, 'Not authorized. Please log in.');
  req.user = user;
  next();
});

// Token optional (public pages that show extra info when logged in)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const user = await getUserFromHeader(req, res);
    if (user) req.user = user;
  } catch (e) {
    res.status(200); // ignore a bad token on public routes
  }
  next();
});

// Role-based access control
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw fail(res, 403, `Access denied. Requires role: ${roles.join(' / ')}`);
  }
  next();
};
