const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');
const escapeRegex = require('../utils/escapeRegex');
const { notify, notifyMany } = require('../utils/notify');

const canManageEvent = (user, event) =>
  user.role === 'ADMIN' ||
  String(event.organizer) === String(user._id) ||
  (user.role === 'CLUB' && user.club && String(event.club) === String(user.club));

exports.canManageEvent = canManageEvent;

const populateEvent = (q) => q.populate('club', 'name logo').populate('organizer', 'name role');

// GET /api/events  ?q=&category=&status=&club=&upcoming=true&mine=true
exports.listEvents = asyncHandler(async (req, res) => {
  // auto-complete events whose day has passed
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  await Event.updateMany({ status: 'UPCOMING', date: { $lt: startOfToday } }, { status: 'COMPLETED' });

  const { q, category, status, club, upcoming, mine } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { venue: rx }];
  }
  if (category) filter.category = category;
  if (status) filter.status = status.toUpperCase();
  if (club) filter.club = club;
  if (upcoming === 'true') {
    filter.date = { $gte: startOfToday };
    filter.status = { $ne: 'CANCELLED' };
  }
  if (mine === 'true' && req.user) filter.organizer = req.user._id;

  const events = await populateEvent(Event.find(filter).sort({ date: upcoming === 'true' ? 1 : -1 })).lean();

  if (req.user) {
    const regs = await EventRegistration.find({
      user: req.user._id, status: 'REGISTERED', event: { $in: events.map((e) => e._id) },
    }).select('event');
    const set = new Set(regs.map((r) => String(r.event)));
    events.forEach((e) => { e.isRegistered = set.has(String(e._id)); });
  }
  events.forEach((e) => { e.isFull = e.registeredCount >= e.capacity; });
  res.json(events);
});

// GET /api/events/registered/me
exports.myRegisteredEvents = asyncHandler(async (req, res) => {
  const regs = await EventRegistration.find({ user: req.user._id, status: 'REGISTERED' })
    .populate({ path: 'event', populate: { path: 'club', select: 'name logo' } })
    .sort({ createdAt: -1 });
  const attended = await Attendance.find({ user: req.user._id }).select('event');
  const attSet = new Set(attended.map((a) => String(a.event)));
  const events = regs
    .filter((r) => r.event)
    .map((r) => ({ ...r.event.toObject(), isRegistered: true, attended: attSet.has(String(r.event._id)), registeredAt: r.createdAt }));
  res.json(events);
});

// GET /api/events/:id
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await populateEvent(Event.findById(req.params.id)).lean();
  if (!event) throw fail(res, 404, 'Event not found');

  const agg = await Feedback.aggregate([
    { $match: { event: event._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  event.averageRating = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
  event.feedbackCount = agg[0] ? agg[0].count : 0;
  event.isFull = event.registeredCount >= event.capacity;

  if (req.user) {
    const [reg, att, fb] = await Promise.all([
      EventRegistration.findOne({ event: event._id, user: req.user._id, status: 'REGISTERED' }),
      Attendance.findOne({ event: event._id, user: req.user._id }),
      Feedback.findOne({ event: event._id, user: req.user._id }),
    ]);
    event.isRegistered = Boolean(reg);
    event.hasAttended = Boolean(att);
    event.myFeedback = fb || null;
    event.canManage = canManageEvent(req.user, event);
  }
  res.json(event);
});

// POST /api/events  (FACULTY, CLUB, ADMIN)
exports.createEvent = asyncHandler(async (req, res) => {
  const { title, description, image, date, time, venue, category, capacity, registrationDeadline } = req.body;
  if (!title || !description || !date || !venue || !capacity) {
    throw fail(res, 400, 'Title, description, date, venue and capacity are required');
  }
  if (Number(capacity) < 1) throw fail(res, 400, 'Capacity must be at least 1');
  if (isNaN(new Date(date).getTime())) throw fail(res, 400, 'Invalid event date');

  let club = req.body.club || undefined;
  if (req.user.role === 'CLUB') {
    if (!req.user.club) throw fail(res, 400, 'Create your club profile before creating events');
    club = req.user.club;
  }

  const event = await Event.create({
    title, description, image, date, time, venue, category,
    capacity: Number(capacity),
    registrationDeadline: registrationDeadline || date,
    organizer: req.user._id,
    club,
  });
  res.status(201).json(await populateEvent(Event.findById(event._id)));
});

// PUT /api/events/:id
exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!canManageEvent(req.user, event)) throw fail(res, 403, 'You cannot edit this event');

  const fields = ['title', 'description', 'image', 'date', 'time', 'venue', 'category', 'capacity', 'registrationDeadline', 'status'];
  fields.forEach((f) => { if (req.body[f] !== undefined) event[f] = req.body[f]; });
  if (Number(event.capacity) < event.registeredCount) {
    throw fail(res, 400, `Capacity cannot be lower than current registrations (${event.registeredCount})`);
  }
  await event.save();

  const regs = await EventRegistration.find({ event: event._id, status: 'REGISTERED' }).select('user');
  const cancelled = event.status === 'CANCELLED';
  await notifyMany(regs.map((r) => r.user), {
    type: cancelled ? 'EVENT_CANCELLED' : 'EVENT_UPDATED',
    title: cancelled ? 'Event cancelled' : 'Event updated',
    message: cancelled ? `"${event.title}" has been cancelled.` : `Details for "${event.title}" were updated. Please check the latest info.`,
    link: `/events/${event._id}`,
  });
  res.json(await populateEvent(Event.findById(event._id)));
});

// DELETE /api/events/:id
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!canManageEvent(req.user, event)) throw fail(res, 403, 'You cannot delete this event');

  const regs = await EventRegistration.find({ event: event._id, status: 'REGISTERED' }).select('user');
  await notifyMany(regs.map((r) => r.user), {
    type: 'EVENT_CANCELLED', title: 'Event cancelled', message: `"${event.title}" has been removed by the organizer.`,
  });
  await Promise.all([
    EventRegistration.deleteMany({ event: event._id }),
    Attendance.deleteMany({ event: event._id }),
    Feedback.deleteMany({ event: event._id }),
    event.deleteOne(),
  ]);
  res.json({ message: 'Event deleted' });
});

// POST /api/events/:id/register
exports.registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (['CANCELLED', 'COMPLETED'].includes(event.status)) throw fail(res, 400, `Registration closed: event is ${event.status.toLowerCase()}`);
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline) && new Date(event.registrationDeadline) < new Date(event.date)) {
    throw fail(res, 400, 'Registration deadline has passed');
  }

  const existing = await EventRegistration.findOne({ event: event._id, user: req.user._id });
  if (existing && existing.status === 'REGISTERED') throw fail(res, 409, 'You are already registered for this event');

  // atomic capacity check + increment (safe against two people grabbing the last seat)
  const updated = await Event.findOneAndUpdate(
    { _id: event._id, $expr: { $lt: ['$registeredCount', '$capacity'] } },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!updated) throw fail(res, 400, 'Sorry, this event is full');

  try {
    if (existing) {
      existing.status = 'REGISTERED';
      await existing.save();
    } else {
      await EventRegistration.create({ event: event._id, user: req.user._id });
    }
  } catch (err) {
    await Event.updateOne({ _id: event._id }, { $inc: { registeredCount: -1 } });
    throw err;
  }

  await notify(req.user._id, {
    type: 'EVENT_REGISTRATION',
    title: 'Registration successful',
    message: `You're registered for "${event.title}" on ${new Date(event.date).toDateString()}.`,
    link: `/events/${event._id}`,
  });
  res.status(201).json({ message: 'Registered successfully', registeredCount: updated.registeredCount, isFull: updated.registeredCount >= updated.capacity });
});

// DELETE /api/events/:id/register
exports.cancelRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  const reg = await EventRegistration.findOne({ event: event._id, user: req.user._id, status: 'REGISTERED' });
  if (!reg) throw fail(res, 404, 'You are not registered for this event');
  if (new Date(event.date) < new Date()) throw fail(res, 400, 'Cannot cancel after the event date');

  reg.status = 'CANCELLED';
  await reg.save();
  const updated = await Event.findOneAndUpdate(
    { _id: event._id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
    { new: true }
  );
  await notify(req.user._id, {
    type: 'SYSTEM', title: 'Registration cancelled', message: `Your registration for "${event.title}" was cancelled.`, link: `/events/${event._id}`,
  });
  res.json({ message: 'Registration cancelled', registeredCount: updated ? updated.registeredCount : event.registeredCount });
});

// GET /api/events/:id/registrations  (organizer/admin/faculty)
exports.eventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!canManageEvent(req.user, event) && req.user.role !== 'FACULTY') throw fail(res, 403, 'Access denied');

  const [regs, att] = await Promise.all([
    EventRegistration.find({ event: event._id, status: 'REGISTERED' }).populate('user', 'name email department year section avatar').sort({ createdAt: 1 }),
    Attendance.find({ event: event._id }).select('user'),
  ]);
  const attSet = new Set(att.map((a) => String(a.user)));
  res.json(regs.filter((r) => r.user).map((r) => ({ _id: r._id, user: r.user, registeredAt: r.createdAt, attended: attSet.has(String(r.user._id)) })));
});

// POST /api/events/:id/remind  (organizer/admin)
exports.sendReminder = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!canManageEvent(req.user, event)) throw fail(res, 403, 'Access denied');
  const regs = await EventRegistration.find({ event: event._id, status: 'REGISTERED' }).select('user');
  await notifyMany(regs.map((r) => r.user), {
    type: 'EVENT_REMINDER', title: 'Event reminder',
    message: `Reminder: "${event.title}" is on ${new Date(event.date).toDateString()} at ${event.time}, ${event.venue}.`,
    link: `/events/${event._id}`,
  });
  res.json({ message: `Reminder sent to ${regs.length} participant(s)` });
});

// POST /api/events/:id/feedback   body: { rating, comment }
exports.submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) throw fail(res, 404, 'Event not found');
  if (!rating || rating < 1 || rating > 5) throw fail(res, 400, 'Rating must be between 1 and 5');

  const attended = await Attendance.findOne({ event: event._id, user: req.user._id });
  const registered = await EventRegistration.findOne({ event: event._id, user: req.user._id, status: 'REGISTERED' });
  if (!attended && !(registered && event.status === 'COMPLETED')) {
    throw fail(res, 403, 'You can give feedback only after attending the event');
  }
  const fb = await Feedback.findOneAndUpdate(
    { event: event._id, user: req.user._id },
    { rating: Number(rating), comment: comment || '' },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(fb);
});

// GET /api/events/:id/feedback
exports.listFeedback = asyncHandler(async (req, res) => {
  const list = await Feedback.find({ event: req.params.id }).populate('user', 'name avatar').sort({ createdAt: -1 });
  res.json(list);
});
