const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['MEMBER', 'VOLUNTEER', 'CORE', 'COORDINATOR'], default: 'MEMBER' },
  },
  { timestamps: true }
);

membershipSchema.index({ club: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', membershipSchema);
