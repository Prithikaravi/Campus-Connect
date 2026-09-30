const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Club name is required'], unique: true, trim: true, maxlength: 80 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Arts', 'Social Service', 'Academic', 'Other'],
      default: 'Other',
    },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    memberCount: { type: Number, default: 0 },
    activities: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        date: { type: Date, default: Date.now },
        volunteerHours: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
