const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coin = require('./models/Coin');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const count = await Coin.countDocuments();
    console.log('Total Coins:', count);
    const coins = await Coin.find();
    console.log('Coins:', JSON.stringify(coins, null, 2));
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

check();
