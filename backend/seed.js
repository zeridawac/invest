const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Coin = require('./models/Coin');
const InviteCode = require('./models/InviteCode');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Coin.deleteMany({});
    await InviteCode.deleteMany({});

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const admin = new User({
      username: 'admin',
      password: adminPassword,
      isAdmin: true,
      points: 10000
    });
    await admin.save();
    console.log('Admin user created (admin / admin123)');

    // Create Invite Codes
    const codes = ['RIG-2026', 'VIP-ACCESS', 'Gamer123'];
    for (const code of codes) {
      await new InviteCode({ code }).save();
    }
    console.log('Initial invite codes created');

    // Create Coins
    const initialCoins = [
      { name: 'Reda Coin', symbol: 'REDA', currentPrice: 100, riskLevel: 'Low', priceHistory: [{ price: 95 }, { price: 98 }, { price: 100 }] },
      { name: 'GoldX', symbol: 'GLDX', currentPrice: 50, riskLevel: 'Medium', priceHistory: [{ price: 55 }, { price: 52 }, { price: 50 }] },
      { name: 'Future Token', symbol: 'FUTR', currentPrice: 200, riskLevel: 'High', priceHistory: [{ price: 150 }, { price: 250 }, { price: 200 }] }
    ];

    for (const c of initialCoins) {
      await new Coin(c).save();
    }
    console.log('Initial coins created');

    console.log('Seeding completed successfully');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
