const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const escapeRegex = require('../utils/escapeRegex');
const { notify } = require('../utils/notify');

const canManageClub = (user, club) =>
  user.role === 'ADMIN' ||
  String(club.owner) === String(user._id) ||
  (club.facultyCoordinator && String(club.facultyCoordinator) === String(user._id));

const loadManageable = async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw fail(res, 404, 'Club not found');
  if (!canManageClub(req.user, club)) throw fail(res, 403, 'You cannot manage this club');
  return club;
};

const populateClub = (q) => q.populate('facultyCoordinator', 'name email').populate('studentCoordinator', 'name email');

// GET /api/clubs ?q=&category=
exports.listClubs = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { description: new RegExp(escapeRegex(q), 'i') }];
  const clubs = await populateClub(Club.find(filter).sort({ memberCount: -1 })).lean();
  if (req.user) {
    const mine = await ClubMembership.find({ user: req.user._id }).select('club');
    const set = new Set(mine.map((m) => String(m.club)));
    clubs.forEach((c) => { c.isMember = set.has(String(c._id)); });
  }
  res.json(clubs);
});

// GET /api/clubs/joined/me
exports.myClubs = asyncHandler(async (req, res) => {
  const ms = await ClubMembership.find({ user: req.user._id }).populate({ path: 'club', populate: { path: 'facultyCoordinator', select: 'name' } });
  res.json(ms.filter((m) => m.club).map((m) => ({ ...m.club.toObject(), memberRole: m.role, isMember: true, joinedAt: m.createdAt })));
});

// GET /api/clubs/:id
exports.getClub = asyncHandler(async (req, res) => {
  const club = await populateClub(Club.findById(req.params.id)).populate('owner', 'name').lean();
  if (!club) throw fail(res, 404, 'Club not found');
  club.events = await Event.find({ club: club._id, status: { $ne: 'CANCELLED' } }).sort({ date: -1 }).limit(20);
  if (req.user) {
    club.isMember = Boolean(await ClubMembership.findOne({ club: club._id, user: req.user._id }));
    club.canManage = canManageClub(req.user, club);
  }
  res.json(club);
});

// POST /api/clubs  (CLUB, FACULTY, ADMIN)
exports.createClub = asyncHandler(async (req, res) => {
  const { name, description, category, logo, coverImage, facultyCoordinator, studentCoordinator } = req.body;
  if (!name || !description) throw fail(res, 400, 'Club name and description are required');
  if (req.user.role === 'CLUB' && req.user.club) throw fail(res, 400, 'Your account already manages a club');

  const club = await Club.create({
    name, description, category, logo, coverImage,
    facultyCoordinator: facultyCoordinator || (req.user.role === 'FACULTY' ? req.user._id : undefined),
    studentCoordinator: studentCoordinator || undefined,
    owner: req.user._id,
  });
  if (req.user.role === 'CLUB') {
    req.user.club = club._id;
    await req.user.save();
  }
  res.status(201).json(club);
});

// PUT /api/clubs/:id
exports.updateClub = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  ['name', 'description', 'category', 'logo', 'coverImage', 'facultyCoordinator', 'studentCoordinator'].forEach((f) => {
    if (req.body[f] !== undefined) club[f] = req.body[f] || undefined;
  });
  await club.save();
  res.json(await populateClub(Club.findById(club._id)));
});

// DELETE /api/clubs/:id  (ADMIN or owner)
exports.deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) throw fail(res, 404, 'Club not found');
  if (req.user.role !== 'ADMIN' && String(club.owner) !== String(req.user._id)) throw fail(res, 403, 'Access denied');
  await Promise.all([
    ClubMembership.deleteMany({ club: club._id }),
    User.updateMany({ club: club._id }, { $unset: { club: 1 } }),
    Event.updateMany({ club: club._id }, { $unset: { club: 1 } }),
    club.deleteOne(),
  ]);
  res.json({ message: 'Club deleted' });
});

// POST /api/clubs/:id/join
exports.joinClub = asyncHandler(async (req, res) => {
  if (!['STUDENT', 'FACULTY'].includes(req.user.role)) throw fail(res, 403, 'Only students and faculty can join clubs');
  const club = await Club.findById(req.params.id);
  if (!club) throw fail(res, 404, 'Club not found');
  if (await ClubMembership.findOne({ club: club._id, user: req.user._id })) throw fail(res, 409, 'You are already a member');

  await ClubMembership.create({ club: club._id, user: req.user._id });
  const updated = await Club.findByIdAndUpdate(club._id, { $inc: { memberCount: 1 } }, { new: true });
  await notify(req.user._id, { type: 'CLUB', title: 'Welcome to the club!', message: `You joined ${club.name}.`, link: `/clubs/${club._id}` });
  await notify(club.owner, { type: 'CLUB', title: 'New member', message: `${req.user.name} joined ${club.name}.`, link: `/clubs/${club._id}` });
  res.status(201).json({ message: 'Joined club', memberCount: updated.memberCount });
});

// DELETE /api/clubs/:id/leave
exports.leaveClub = asyncHandler(async (req, res) => {
  const m = await ClubMembership.findOneAndDelete({ club: req.params.id, user: req.user._id });
  if (!m) throw fail(res, 404, 'You are not a member of this club');
  const updated = await Club.findOneAndUpdate({ _id: req.params.id, memberCount: { $gt: 0 } }, { $inc: { memberCount: -1 } }, { new: true });
  res.json({ message: 'Left club', memberCount: updated ? updated.memberCount : 0 });
});

// GET /api/clubs/:id/members
exports.listMembers = asyncHandler(async (req, res) => {
  await loadManageable(req, res);
  const ms = await ClubMembership.find({ club: req.params.id }).populate('user', 'name email department year section avatar').sort({ createdAt: 1 });
  res.json(ms.filter((m) => m.user));
});

// PUT /api/clubs/:id/members/:userId   body: { role }
exports.updateMemberRole = asyncHandler(async (req, res) => {
  await loadManageable(req, res);
  const { role } = req.body;
  if (!['MEMBER', 'VOLUNTEER', 'CORE', 'COORDINATOR'].includes(role)) throw fail(res, 400, 'Invalid member role');
  const m = await ClubMembership.findOneAndUpdate({ club: req.params.id, user: req.params.userId }, { role }, { new: true });
  if (!m) throw fail(res, 404, 'Member not found');
  res.json(m);
});

// DELETE /api/clubs/:id/members/:userId
exports.removeMember = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  const m = await ClubMembership.findOneAndDelete({ club: club._id, user: req.params.userId });
  if (!m) throw fail(res, 404, 'Member not found');
  await Club.updateOne({ _id: club._id, memberCount: { $gt: 0 } }, { $inc: { memberCount: -1 } });
  await notify(req.params.userId, { type: 'CLUB', title: 'Removed from club', message: `You were removed from ${club.name}.` });
  res.json({ message: 'Member removed' });
});

// POST /api/clubs/:id/invite   body: { email }
exports.inviteUser = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user) throw fail(res, 404, 'No user found with that email');
  await notify(user._id, { type: 'CLUB_INVITE', title: 'Club invitation', message: `You are invited to join ${club.name}.`, link: `/clubs/${club._id}` });
  res.json({ message: `Invitation sent to ${user.name}` });
});

// POST /api/clubs/:id/activities
exports.addActivity = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  const { title, description, date, volunteerHours } = req.body;
  if (!title) throw fail(res, 400, 'Activity title is required');
  club.activities.push({ title, description, date, volunteerHours: Number(volunteerHours) || 0 });
  await club.save();
  res.status(201).json(club.activities);
});

// DELETE /api/clubs/:id/activities/:activityId
exports.deleteActivity = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  club.activities = club.activities.filter((a) => String(a._id) !== req.params.activityId);
  await club.save();
  res.json(club.activities);
});

// GET /api/clubs/:id/analytics
exports.clubAnalytics = asyncHandler(async (req, res) => {
  const club = await loadManageable(req, res);
  const events = await Event.find({ club: club._id }).sort({ date: -1 });
  const ids = events.map((e) => e._id);
  const [registrations, attendance] = await Promise.all([
    EventRegistration.countDocuments({ event: { $in: ids }, status: 'REGISTERED' }),
    Attendance.countDocuments({ event: { $in: ids } }),
  ]);
  const attByEvent = await Attendance.aggregate([{ $match: { event: { $in: ids } } }, { $group: { _id: '$event', count: { $sum: 1 } } }]);
  const attMap = Object.fromEntries(attByEvent.map((a) => [String(a._id), a.count]));

  res.json({
    members: club.memberCount,
    eventsConducted: events.filter((e) => e.status === 'COMPLETED').length,
    totalEvents: events.length,
    registrations,
    attendance,
    attendanceRate: registrations ? Math.round((attendance / registrations) * 100) : 0,
    engagement: club.memberCount ? Math.min(100, Math.round((attendance / Math.max(1, club.memberCount)) * 25 + (registrations / Math.max(1, club.memberCount)) * 15)) : 0,
    perEvent: events.slice(0, 8).reverse().map((e) => ({
      title: e.title, registrations: e.registeredCount, attended: attMap[String(e._id)] || 0,
    })),
  });
});
