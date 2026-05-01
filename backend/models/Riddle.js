const mongoose = require('mongoose');

const RiddleSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  rewardPoints: { type: Number, required: true },
  solvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Riddle', RiddleSchema);
