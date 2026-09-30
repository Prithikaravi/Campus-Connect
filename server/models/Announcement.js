const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    content: { type: String, required: [true, 'Content is required'], maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    audience: {
      type: {
        type: String,
        enum: ['EVERYONE', 'STUDENTS', 'FACULTY', 'DEPARTMENT', 'YEAR', 'CLUB_MEMBERS'],
        default: 'EVERYONE',
      },
      department: { type: String, default: '' },
      year: { type: Number },
      club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
