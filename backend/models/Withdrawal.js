const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  amountUSD: { type: Number, required: true },
  method: { type: String, default: 'Bank' },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    fullName: String
  },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
