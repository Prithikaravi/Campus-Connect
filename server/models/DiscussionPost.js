const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    content: { type: String, required: [true, 'Content is required'], maxlength: 5000 },
    category: {
      type: String,
      enum: ['General', 'Academics', 'Placements', 'Events', 'Clubs', 'Help', 'Off-topic'],
      default: 'General',
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiscussionPost', postSchema);
