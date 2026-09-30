const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, maxlength: 1000, default: '' },
    type: {
      type: String,
      enum: ['Hackathon', 'Competition', 'Certification', 'Academic', 'Sports', 'Cultural', 'Volunteering', 'Other'],
      default: 'Other',
    },
    organization: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    hours: { type: Number, default: 0, min: 0 }, // volunteer hours
    certificateUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
