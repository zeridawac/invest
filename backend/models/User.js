const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 1000 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now },
  lastSpinDate: { type: String, default: "" }, // YYYY-MM-DD
  spinCount: { type: Number, default: 0 },
  lastTapTime: { type: Date, default: null },
  lastLoginDate: { type: String, default: "" },
  lastClaimDate: { type: String, default: "" }, // YYYY-MM-DD
  bankDetails: {
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    fullName: { type: String, default: "" }
  },
  isBan: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  hasSeenWelcome: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
