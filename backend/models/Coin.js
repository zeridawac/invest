const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  currentPrice: { type: Number, required: true },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  isEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coin', CoinSchema);
