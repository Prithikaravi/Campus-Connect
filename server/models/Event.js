const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    image: { type: String, default: '' },
    date: { type: Date, required: [true, 'Event date is required'] },
    time: { type: String, default: '10:00 AM' },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    category: {
      type: String,
      enum: ['Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Competition', 'Volunteering', 'Technical', 'Other'],
      default: 'Other',
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: [1, 'Capacity must be at least 1'] },
    registeredCount: { type: Number, default: 0, min: 0 },
    registrationDeadline: { type: Date },
    status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
