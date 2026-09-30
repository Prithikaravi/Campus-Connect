const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['STUDENT', 'FACULTY', 'CLUB', 'ADMIN'], default: 'STUDENT' },
    phone: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    year: { type: Number, min: 1, max: 6 },
    section: { type: String, trim: true, default: '' },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    bio: { type: String, maxlength: 500, default: '' },
    avatar: { type: String, default: '' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' }, // for CLUB role accounts
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
