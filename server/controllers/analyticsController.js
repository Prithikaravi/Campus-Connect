const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const ClubMembership = require('../models/ClubMembership');
const DiscussionPost = require('../models/DiscussionPost');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const { buildStudentStats, monthBuckets, monthKey } = require('../utils/stats');

// GET /api/analytics/student
exports.studentAnalytics = asyncHandler(async (req, res) => {
  const s = await buildStudentStats(req.user._id);
  res.json({ stats: s.stats, level: s.level, trend: s.trend });
});

// GET /api/analytics/dashboard  (STUDENT) - everything the student dashboard needs in one call
exports.studentDashboard = asyncHandler(async (req, res) => {
  const Announcement = require('../models/Announcement');
  const Notification = require('../models/Notification');
  const now = new Date();
  const [s, regs, memberships, notifications, unread, upcoming, announcements] = await Promise.all([
    buildStudentStats(req.user._id),
    EventRegistration.find({ user: req.user._id, status: 'REGISTERED' }).populate('event'),
    ClubMembership.find({ user: req.user._id }).populate('club', 'name logo category memberCount'),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Notification.countDocuments({ user: req.user._id, read: false }),
    Event.find({ date: { $gte: now }, status: { $in: ['UPCOMING', 'ONGOING'] } }).populate('club', 'name').sort({ date: 1 }).limit(6),
    Announcement.find({ $or: [{ 'audience.type': 'EVERYONE' }, { 'audience.type': 'STUDENTS' }, { 'audience.type': 'DEPARTMENT', 'audience.department': req.user.department }] })
      .populate('author', 'name').sort({ createdAt: -1 }).limit(4),
  ]);
  res.json({
    user: req.user,
    stats: s.stats,
    level: s.level,
    trend: s.trend,
    badges: s.badges.filter((b) => b.earned),
    achievements: s.achievementList.slice(0, 4),
    registeredEvents: regs.filter((r) => r.event && new Date(r.event.date) >= now).map((r) => r.event).slice(0, 5),
    joinedClubs: memberships.filter((m) => m.club).map((m) => m.club),
    upcomingEvents: upcoming,
    announcements,
    notifications,
    unreadCount: unread,
  });
});

// GET /api/analytics/passport  ?userId= (FACULTY/ADMIN can view any student)
exports.passport = asyncHandler(async (req, res) => {
  let user = req.user;
  if (req.query.userId && String(req.query.userId) !== String(req.user._id)) {
    if (!['ADMIN', 'FACULTY'].includes(req.user.role)) throw fail(res, 403, 'Access denied');
    user = await User.findById(req.query.userId);
    if (!user) throw fail(res, 404, 'Student not found');
  }
  const [s, memberships] = await Promise.all([
    buildStudentStats(user._id),
    ClubMembership.find({ user: user._id }).populate('club', 'name logo category activities'),
  ]);
  const clubs = memberships.filter((m) => m.club).map((m) => ({ ...m.club.toObject(), memberRole: m.role, joinedAt: m.createdAt }));

  const timeline = [
    ...s.attendedEvents.map((e) => ({ type: 'event', title: `Attended ${e.title}`, date: e.date })),
    ...s.achievementList.map((a) => ({ type: 'achievement', title: a.title, date: a.date, category: a.type })),
    ...clubs.map((c) => ({ type: 'club', title: `Joined ${c.name}`, date: c.joinedAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);

  const skillGroups = {};
  s.achievementList.forEach((a) => { skillGroups[a.type] = (skillGroups[a.type] || 0) + 1; });

  res.json({
    student: {
      _id: user._id, name: user.name, email: user.email, department: user.department, year: user.year,
      section: user.section, avatar: user.avatar, skills: user.skills, interests: user.interests, bio: user.bio,
    },
    stats: s.stats,
    level: s.level,
    badges: s.badges,
    trend: s.trend,
    clubs,
    clubActivities: clubs.reduce((n, c) => n + (c.activities || []).length, 0),
    achievements: s.achievementList,
    certificates: s.achievementList.filter((a) => a.certificateUrl || a.type === 'Certification'),
    achievementBreakdown: Object.entries(skillGroups).map(([type, count]) => ({ type, count })),
    eventsAttended: s.attendedEvents,
    timeline,
  });
});

// GET /api/analytics/faculty  (FACULTY, ADMIN)
exports.facultyAnalytics = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'ADMIN' ? {} : { organizer: req.user._id };
  const events = await Event.find(filter).sort({ date: -1 });
  const ids = events.map((e) => e._id);
  const [registrations, attendance, byEvent, topStudents] = await Promise.all([
    EventRegistration.countDocuments({ event: { $in: ids }, status: 'REGISTERED' }),
    Attendance.countDocuments({ event: { $in: ids } }),
    Attendance.aggregate([{ $match: { event: { $in: ids } } }, { $group: { _id: '$event', count: { $sum: 1 } } }]),
    Attendance.aggregate([
      { $group: { _id: '$user', attended: { $sum: 1 } } }, { $sort: { attended: -1 } }, { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: '$user' },
      { $project: { attended: 1, name: '$user.name', department: '$user.department', year: '$user.year' } },
    ]),
  ]);
  const map = Object.fromEntries(byEvent.map((a) => [String(a._id), a.count]));
  res.json({
    totalEvents: events.length,
    upcomingEvents: events.filter((e) => e.status === 'UPCOMING').length,
    registrations,
    attendance,
    attendanceRate: registrations ? Math.round((attendance / registrations) * 100) : 0,
    perEvent: events.slice(0, 8).reverse().map((e) => ({ id: e._id, title: e.title, registrations: e.registeredCount, attended: map[String(e._id)] || 0 })),
    topStudents,
  });
});

// GET /api/analytics/admin  (ADMIN)
exports.adminAnalytics = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [students, faculty, clubs, events, registrations, attendance, activeUsers, popularEvents, popularClubs, byCategory, byDepartment, regTrend, posts] =
    await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'FACULTY' }),
      Club.countDocuments(),
      Event.countDocuments(),
      EventRegistration.countDocuments({ status: 'REGISTERED' }),
      Attendance.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: weekAgo } }),
      Event.find().sort({ registeredCount: -1 }).limit(5).select('title registeredCount capacity category image'),
      Club.find().sort({ memberCount: -1 }).limit(5).select('name memberCount category logo'),
      Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      User.aggregate([{ $match: { role: 'STUDENT', department: { $ne: '' } } }, { $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      EventRegistration.find({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } }).select('createdAt'),
      DiscussionPost.countDocuments(),
    ]);

  const trend = monthBuckets(6);
  regTrend.forEach((r) => {
    const b = trend.find((t) => t.key === monthKey(r.createdAt));
    if (b) b.count += 1;
  });

  res.json({
    totals: { students, faculty, clubs, events, registrations, attendance, activeUsers, posts },
    attendanceRate: registrations ? Math.round((attendance / registrations) * 100) : 0,
    popularEvents, popularClubs,
    eventsByCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    studentsByDepartment: byDepartment.map((d) => ({ department: d._id, count: d.count })),
    registrationTrend: trend.map((t) => ({ month: t.label, registrations: t.count })),
  });
});

// GET /api/analytics/registrations  (ADMIN, FACULTY)
exports.allRegistrations = asyncHandler(async (req, res) => {
  const list = await EventRegistration.find({ status: 'REGISTERED' })
    .populate('user', 'name email department year')
    .populate('event', 'title date')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(list.filter((r) => r.user && r.event));
});

// GET /api/analytics/attendance  (ADMIN, FACULTY)
exports.allAttendance = asyncHandler(async (req, res) => {
  const list = await Attendance.find()
    .populate('user', 'name email department year')
    .populate('event', 'title date')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(list.filter((r) => r.user && r.event));
});
