const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Coin = require('../models/Coin');
const InviteCode = require('../models/InviteCode');
const Announcement = require('../models/Announcement');
const Coupon = require('../models/Coupon');
const GlobalSetting = require('../models/GlobalSetting');
const Riddle = require('../models/Riddle');

// Coins
router.post('/coins', [auth, admin], async (req, res) => {
  const { name, symbol, currentPrice, riskLevel } = req.body;
  try {
    const coin = new Coin({ name, symbol, currentPrice, riskLevel });
    await coin.save();
    res.json(coin);
  } catch (err) { res.status(500).send('Server error'); }
});

router.put('/coins/:id', [auth, admin], async (req, res) => {
  try {
    const coin = await Coin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coin);
  } catch (err) { res.status(500).send('Server error'); }
});

// Manual Pump/Dump
router.post('/coins/:id/price', [auth, admin], async (req, res) => {
  const { newPrice } = req.body;
  try {
    const coin = await Coin.findById(req.params.id);
    coin.priceHistory.push({ price: coin.currentPrice });
    coin.currentPrice = newPrice;
    await coin.save();
    res.json(coin);
  } catch (err) { res.status(500).send('Server error'); }
});

// Settings
router.get('/settings', [auth, admin], async (req, res) => {
  try {
    let rate = await GlobalSetting.findOne({ key: 'coinRate' });
    if (!rate) {
      rate = new GlobalSetting({ key: 'coinRate', value: 0.0001 });
      await rate.save();
    }
    res.json(rate);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/settings', [auth, admin], async (req, res) => {
  const { coinRate } = req.body;
  try {
    let rate = await GlobalSetting.findOne({ key: 'coinRate' });
    if (!rate) rate = new GlobalSetting({ key: 'coinRate' });
    rate.value = Number(coinRate);
    await rate.save();
    res.json(rate);
  } catch (err) { res.status(500).send('Server error'); }
});

// Users
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).send('Server error'); }
});

router.patch('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/users/:id/ban', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBan = !user.isBan;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/users/:id/points', [auth, admin], async (req, res) => {
  const { points } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.points += Number(points);
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/users/:id/ban', [auth, admin], async (req, res) => {
  const { isBan } = req.body;
  try {
    const user = await User.findById(req.params.id);
    user.isBan = isBan;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).send('Server error'); }
});

// Invite Codes
router.post('/invite-codes', [auth, admin], async (req, res) => {
  const { code } = req.body;
  try {
    let existing = await InviteCode.findOne({ code });
    if (existing) return res.status(400).json({ message: 'كود الدعوة موجود بالفعل' });

    const invite = new InviteCode({ code });
    await invite.save();
    res.json(invite);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/invite-codes', [auth, admin], async (req, res) => {
  try {
    const codes = await InviteCode.find().populate('usedBy', 'username');
    res.json(codes);
  } catch (err) { res.status(500).send('Server error'); }
});

// Announcements
router.post('/announcements', [auth, admin], async (req, res) => {
  const { message, imageUrl } = req.body;
  try {
    const announcement = new Announcement({ message, imageUrl, author: req.user.id });
    await announcement.save();
    res.json(announcement);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/announcements', [auth, admin], async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) { res.status(500).send('Server error'); }
});

// Riddles (Admin)
router.post('/riddles', [auth, admin], async (req, res) => {
  const { question, answer, rewardPoints } = req.body;
  try {
    const riddle = new Riddle({ question, answer, rewardPoints });
    await riddle.save();
    res.json(riddle);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/riddles', [auth, admin], async (req, res) => {
  try {
    const riddles = await Riddle.find().sort({ createdAt: -1 });
    res.json(riddles);
  } catch (err) { res.status(500).send('Server error'); }
});

// Coupons (Admin)
router.post('/coupons', [auth, admin], async (req, res) => {
  const { code, rewardPoints, maxUses } = req.body;
  try {
    const coupon = new Coupon({ code, rewardPoints, maxUses });
    await coupon.save();
    res.json(coupon);
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/coupons', [auth, admin], async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
