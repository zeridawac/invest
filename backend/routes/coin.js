const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Coin = require('../models/Coin');

// @route   GET api/coins
router.get('/', auth, async (req, res) => {
  try {
    const coins = await Coin.find({ isEnabled: true });
    res.json(coins);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
