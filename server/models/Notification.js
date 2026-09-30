const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'EVENT_REGISTRATION', 'EVENT_REMINDER', 'EVENT_UPDATED', 'EVENT_CANCELLED',
        'ANNOUNCEMENT', 'CLUB_INVITE', 'CLUB', 'ACHIEVEMENT', 'ATTENDANCE', 'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
