const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coin: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
  amount: { type: Number, required: true }, // Points invested
  buyPrice: { type: Number, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  sellPrice: { type: Number },
  profitPoints: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
