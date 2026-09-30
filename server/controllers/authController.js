const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const generateToken = require('../utils/generateToken');

const emailRe = /^\S+@\S+\.\S+$/;

// POST /api/auth/register  (STUDENT or FACULTY only)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department, year, section } = req.body;
  const role = String(req.body.role || 'STUDENT').toUpperCase();

  if (!name || !email || !password) throw fail(res, 400, 'Name, email and password are required');
  if (!emailRe.test(email)) throw fail(res, 400, 'Please enter a valid email address');
  if (password.length < 6) throw fail(res, 400, 'Password must be at least 6 characters');
  if (!['STUDENT', 'FACULTY'].includes(role)) {
    throw fail(res, 403, 'Only Student and Faculty accounts can self-register');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw fail(res, 409, 'An account with this email already exists');

  const user = await User.create({
    name, email, password, role, phone, department, section,
    year: year ? Number(year) : undefined,
  });

  res.status(201).json({ token: generateToken(user._id), user });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw fail(res, 400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw fail(res, 401, 'Invalid email or password');
  }
  if (!user.isActive) throw fail(res, 403, 'Your account has been disabled. Contact the admin.');

  user.lastLoginAt = new Date();
  await user.save();

  res.json({ token: generateToken(user._id), user });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('club', 'name logo');
  res.json({ user });
});
