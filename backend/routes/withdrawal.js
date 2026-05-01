const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const GlobalSetting = require('../models/GlobalSetting');

// @route   POST api/withdrawals
router.post('/', auth, async (req, res) => {
  let { points, bankDetails } = req.body;
  try {
    points = Number(points);
    const user = await User.findById(req.user.id);

    if (user.points < points) return res.status(400).json({ message: 'النقاط غير كافية' });
    if (points < 100) return res.status(400).json({ message: 'الحد الأدنى للسحب هو 100 كوين' });

    let rateSetting = await GlobalSetting.findOne({ key: 'coinRate' });
    const rate = rateSetting ? rateSetting.value : 0.0001;

    const amountUSD = points * rate;
    
    if (amountUSD < 10) {
      return res.status(400).json({ message: `الحد الأدنى للسحب هو 10 دولار (ما يعادل ${Math.ceil(10 / rate)} كوين)` });
    }

    // Update user bank details for future use
    if (bankDetails) {
      user.bankDetails = bankDetails;
      await user.save();
    }

    const withdrawal = new Withdrawal({
      user: req.user.id,
      points,
      amountUSD,
      bankDetails
    });

    user.points -= points;
    await user.save();
    await withdrawal.save();

    res.json(withdrawal);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/withdrawals/my
router.get('/my', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/withdrawals/admin
router.get('/admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const withdrawals = await Withdrawal.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/withdrawals/admin/:id
router.patch('/admin/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });

    if (status === 'rejected' && withdrawal.status === 'pending') {
      const targetUser = await User.findById(withdrawal.user);
      targetUser.points += withdrawal.points;
      await targetUser.save();
    }

    withdrawal.status = status;
    await withdrawal.save();

    res.json(withdrawal);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
