const Notification = require('../models/Notification');

// Notifications must never break the main request, so errors are only logged.
exports.notify = async (userId, { type = 'SYSTEM', title, message, link = '' }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (e) {
    console.error('notify failed:', e.message);
  }
};

exports.notifyMany = async (userIds, { type = 'SYSTEM', title, message, link = '' }) => {
  if (!userIds || !userIds.length) return;
  try {
    await Notification.insertMany(
      userIds.map((user) => ({ user, type, title, message, link }))
    );
  } catch (e) {
    console.error('notifyMany failed:', e.message);
  }
};
