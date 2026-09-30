const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const { notifyMany } = require('../utils/notify');
const { canManageEvent } = require('./eventController');

const loadManageableEvent = async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!canManageEvent(req.user, event) && req.user.role !== 'FACULTY') throw fail(res, 403, 'Access denied');
  return event;
};

// POST /api/attendance/:eventId   body: { userIds: [] }
exports.markAttendance = asyncHandler(async (req, res) => {
  const event = await loadManageableEvent(req, res);
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || !userIds.length) throw fail(res, 400, 'Provide userIds array');

  const regs = await EventRegistration.find({ event: event._id, status: 'REGISTERED', user: { $in: userIds } }).select('user');
  const validIds = regs.map((r) => r.user);
  if (!validIds.length) throw fail(res, 400, 'None of these users are registered for this event');

  await Attendance.bulkWrite(
    validIds.map((user) => ({
      updateOne: {
        filter: { event: event._id, user },
        update: { $setOnInsert: { event: event._id, user, markedBy: req.user._id } },
        upsert: true,
      },
    }))
  );
  await notifyMany(validIds, {
    type: 'ATTENDANCE', title: 'Attendance recorded',
    message: `Your attendance for "${event.title}" was recorded. It now counts towards your Growth Passport!`,
    link: '/passport',
  });
  res.json({ message: `Attendance marked for ${validIds.length} participant(s)` });
});

// DELETE /api/attendance/:eventId/:userId
exports.unmarkAttendance = asyncHandler(async (req, res) => {
  const event = await loadManageableEvent(req, res);
  await Attendance.deleteOne({ event: event._id, user: req.params.userId });
  res.json({ message: 'Attendance removed' });
});

// GET /api/attendance/:eventId
exports.getEventAttendance = asyncHandler(async (req, res) => {
  const event = await loadManageableEvent(req, res);
  const list = await Attendance.find({ event: event._id }).populate('user', 'name email department year section');
  res.json({ total: list.length, registered: event.registeredCount, attendance: list });
});

// GET /api/attendance/me/history
exports.myAttendance = asyncHandler(async (req, res) => {
  const list = await Attendance.find({ user: req.user._id }).populate({ path: 'event', select: 'title date category venue image' }).sort({ createdAt: -1 });
  res.json(list.filter((a) => a.event));
});
