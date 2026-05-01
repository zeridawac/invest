const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
