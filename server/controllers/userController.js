const User = require('../models/User');
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const escapeRegex = require('../utils/escapeRegex');
const { buildStudentStats } = require('../utils/stats');

const buildProfile = async (user) => {
  const memberships = await ClubMembership.find({ user: user._id }).populate('club', 'name logo category');
  const data = { user, clubs: memberships.filter((m) => m.club).map((m) => ({ ...m.club.toObject(), memberRole: m.role })) };
  if (user.role === 'STUDENT') {
    const s = await buildStudentStats(user._id);
    data.stats = s.stats;
    data.achievements = s.achievementList;
    data.eventsAttended = s.attendedEvents;
  }
  return data;
};

// GET /api/users/me
exports.getMyProfile = asyncHandler(async (req, res) => {
  res.json(await buildProfile(req.user));
});

// PUT /api/users/me
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'department', 'year', 'section', 'skills', 'interests', 'bio', 'avatar'];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  if (req.body.name !== undefined && !String(req.body.name).trim()) throw fail(res, 400, 'Name cannot be empty');
  ['skills', 'interests'].forEach((f) => {
    if (typeof req.user[f] === 'string') req.user[f] = req.user[f].split(',').map((s) => s.trim()).filter(Boolean);
  });
  await req.user.save();
  res.json({ user: req.user });
});

// PUT /api/users/me/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw fail(res, 400, 'Current and new password are required');
  if (newPassword.length < 6) throw fail(res, 400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw fail(res, 401, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

// GET /api/users  (ADMIN, FACULTY)  ?q=&role=&department=&page=&limit=
exports.listUsers = asyncHandler(async (req, res) => {
  const { q, role, department } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const filter = {};
  if (role) filter.role = role.toUpperCase();
  if (department) filter.department = department;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/users/:id  (self, ADMIN, FACULTY)
exports.getUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.params.id) === String(req.user._id);
  if (!isSelf && !['ADMIN', 'FACULTY'].includes(req.user.role)) throw fail(res, 403, 'Access denied');
  const user = await User.findById(req.params.id);
  if (!user) throw fail(res, 404, 'User not found');
  res.json(await buildProfile(user));
});

// PUT /api/users/:id/role  (ADMIN)  body: { role, club }
exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['STUDENT', 'FACULTY', 'CLUB', 'ADMIN'].includes(role)) throw fail(res, 400, 'Invalid role');
  const user = await User.findById(req.params.id);
  if (!user) throw fail(res, 404, 'User not found');
  if (String(user._id) === String(req.user._id) && role !== 'ADMIN') {
    throw fail(res, 400, 'You cannot remove your own admin role');
  }
  user.role = role;
  if (req.body.club) {
    if (!(await Club.findById(req.body.club))) throw fail(res, 404, 'Club not found');
    user.club = req.body.club;
  }
  await user.save();
  res.json({ user });
});

// PATCH /api/users/:id/status  (ADMIN)  body: { isActive }
exports.setStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw fail(res, 404, 'User not found');
  if (String(user._id) === String(req.user._id)) throw fail(res, 400, 'You cannot disable your own account');
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ user });
});

// DELETE /api/users/:id  (ADMIN)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw fail(res, 404, 'User not found');
  if (String(user._id) === String(req.user._id)) throw fail(res, 400, 'You cannot delete your own account');
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});
