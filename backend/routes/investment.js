const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Coin = require('../models/Coin');
const Investment = require('../models/Investment');

// @route   POST api/investments/buy
router.post('/buy', auth, async (req, res) => {
  const { coinId, amount } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.points < amount) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    const coin = await Coin.findById(coinId);
    if (!coin || !coin.isEnabled) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    const investment = new Investment({
      user: user._id,
      coin: coin._id,
      amount: amount,
      buyPrice: coin.currentPrice
    });

    user.points -= amount;
    await user.save();
    await investment.save();

    res.json({ investment, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/investments/sell/:id
router.post('/sell/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('coin');
    if (!investment || investment.status === 'closed') {
      return res.status(404).json({ message: 'Investment not found or already closed' });
    }

    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentPrice = investment.coin.currentPrice;
    const profitRatio = currentPrice / investment.buyPrice;
    const profitPoints = Math.floor(investment.amount * profitRatio);

    investment.status = 'closed';
    investment.sellPrice = currentPrice;
    investment.profitPoints = profitPoints;
    await investment.save();

    const user = await User.findById(req.user.id);
    user.points += profitPoints;
    await user.save();

    res.json({ investment, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/investments/me
router.get('/me', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id, status: 'active' }).populate('coin');
    res.json(investments);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
