const mongoose = require('mongoose');

const GlobalSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
