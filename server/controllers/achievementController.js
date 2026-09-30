const Achievement = require('../models/Achievement');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const { notify } = require('../utils/notify');

// GET /api/achievements  (mine)  ?type=
exports.listMine = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  res.json(await Achievement.find(filter).sort({ date: -1 }));
});

// GET /api/achievements/user/:userId  (FACULTY, ADMIN)
exports.listForUser = asyncHandler(async (req, res) => {
  res.json(await Achievement.find({ user: req.params.userId }).sort({ date: -1 }));
});

// POST /api/achievements
exports.create = asyncHandler(async (req, res) => {
  const { title, description, type, organization, date, hours, certificateUrl } = req.body;
  if (!title) throw fail(res, 400, 'Title is required');
  const a = await Achievement.create({
    user: req.user._id, title, description, type, organization, date, certificateUrl,
    hours: Number(hours) || 0,
  });
  await notify(req.user._id, {
    type: 'ACHIEVEMENT', title: 'Achievement earned 🏆',
    message: `"${title}" was added to your Growth Passport.`, link: '/passport',
  });
  res.status(201).json(a);
});

const loadOwn = async (req, res) => {
  const a = await Achievement.findById(req.params.id);
  if (!a) throw fail(res, 404, 'Achievement not found');
  if (String(a.user) !== String(req.user._id) && req.user.role !== 'ADMIN') throw fail(res, 403, 'Access denied');
  return a;
};

// PUT /api/achievements/:id
exports.update = asyncHandler(async (req, res) => {
  const a = await loadOwn(req, res);
  ['title', 'description', 'type', 'organization', 'date', 'hours', 'certificateUrl'].forEach((f) => {
    if (req.body[f] !== undefined) a[f] = req.body[f];
  });
  await a.save();
  res.json(a);
});

// DELETE /api/achievements/:id
exports.remove = asyncHandler(async (req, res) => {
  const a = await loadOwn(req, res);
  await a.deleteOne();
  res.json({ message: 'Achievement deleted' });
});
