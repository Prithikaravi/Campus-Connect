const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const fail = require('../utils/fail');

// GET /api/notifications ?unread=true&limit=
exports.list = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.unread === 'true') filter.read = false;
  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 50, 100)),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ notifications, unreadCount });
});

// GET /api/notifications/unread-count
exports.unreadCount = asyncHandler(async (req, res) => {
  res.json({ unreadCount: await Notification.countDocuments({ user: req.user._id, read: false }) });
});

// PUT /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read', unreadCount: 0 });
});

// PUT /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!n) throw fail(res, 404, 'Notification not found');
  res.json(n);
});

// DELETE /api/notifications/:id
exports.remove = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!n) throw fail(res, 404, 'Notification not found');
  res.json({ message: 'Notification deleted' });
});
