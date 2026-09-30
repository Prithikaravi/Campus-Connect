const Announcement = require('../models/Announcement');
const ClubMembership = require('../models/ClubMembership');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const escapeRegex = require('../utils/escapeRegex');
const { notifyMany } = require('../utils/notify');

const audienceUserIds = async (aud, excludeId) => {
  const q = { isActive: true };
  switch (aud.type) {
    case 'STUDENTS': q.role = 'STUDENT'; break;
    case 'FACULTY': q.role = 'FACULTY'; break;
    case 'DEPARTMENT': q.department = aud.department; break;
    case 'YEAR': q.role = 'STUDENT'; q.year = aud.year; break;
    case 'CLUB_MEMBERS': {
      const ms = await ClubMembership.find({ club: aud.club }).select('user');
      q._id = { $in: ms.map((m) => m.user) };
      break;
    }
    default: break;
  }
  const users = await User.find(q).select('_id');
  return users.map((u) => u._id).filter((id) => String(id) !== String(excludeId));
};

const visibleTo = async (user) => {
  if (user.role === 'ADMIN') return {};
  const or = [{ 'audience.type': 'EVERYONE' }, { author: user._id }];
  if (user.department) or.push({ 'audience.type': 'DEPARTMENT', 'audience.department': user.department });
  if (user.role === 'STUDENT') {
    or.push({ 'audience.type': 'STUDENTS' });
    if (user.year) or.push({ 'audience.type': 'YEAR', 'audience.year': user.year });
  }
  if (user.role === 'FACULTY') or.push({ 'audience.type': 'FACULTY' });
  const clubIds = (await ClubMembership.find({ user: user._id }).select('club')).map((m) => m.club);
  if (user.club) clubIds.push(user.club);
  if (clubIds.length) or.push({ 'audience.type': 'CLUB_MEMBERS', 'audience.club': { $in: clubIds } });
  return { $or: or };
};

// GET /api/announcements ?q=&priority=&limit=
exports.listAnnouncements = asyncHandler(async (req, res) => {
  const { q, priority, limit } = req.query;
  const and = [await visibleTo(req.user)];
  if (priority) and.push({ priority: priority.toUpperCase() });
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: [{ title: rx }, { content: rx }] });
  }
  const list = await Announcement.find({ $and: and })
    .populate('author', 'name role')
    .populate('audience.club', 'name')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 100));
  res.json(list);
});

// POST /api/announcements (FACULTY, CLUB, ADMIN)
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority, image } = req.body;
  const audience = { type: 'EVERYONE', ...(req.body.audience || {}) };
  if (!title || !content) throw fail(res, 400, 'Title and content are required');

  if (req.user.role === 'CLUB') {
    if (!req.user.club) throw fail(res, 400, 'Create your club profile first');
    if (!['CLUB_MEMBERS', 'EVERYONE'].includes(audience.type)) audience.type = 'CLUB_MEMBERS';
    audience.club = req.user.club;
  }
  if (audience.type === 'DEPARTMENT' && !audience.department) throw fail(res, 400, 'Department is required for this audience');
  if (audience.type === 'YEAR' && !audience.year) throw fail(res, 400, 'Year is required for this audience');
  if (audience.type === 'CLUB_MEMBERS' && !audience.club) throw fail(res, 400, 'Club is required for this audience');

  const a = await Announcement.create({ title, content, priority, image, audience, author: req.user._id });
  const ids = await audienceUserIds(audience, req.user._id);
  await notifyMany(ids, { type: 'ANNOUNCEMENT', title: `New announcement: ${title}`, message: content.slice(0, 120), link: '/announcements' });
  res.status(201).json(await Announcement.findById(a._id).populate('author', 'name role'));
});

const loadOwned = async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) throw fail(res, 404, 'Announcement not found');
  if (req.user.role !== 'ADMIN' && String(a.author) !== String(req.user._id)) throw fail(res, 403, 'You can only modify your own announcements');
  return a;
};

// PUT /api/announcements/:id
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const a = await loadOwned(req, res);
  ['title', 'content', 'priority', 'image', 'audience'].forEach((f) => { if (req.body[f] !== undefined) a[f] = req.body[f]; });
  await a.save();
  res.json(a);
});

// DELETE /api/announcements/:id
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const a = await loadOwned(req, res);
  await a.deleteOne();
  res.json({ message: 'Announcement deleted' });
});
