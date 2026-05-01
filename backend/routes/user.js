const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Daily Reward Logic
    const today = new Date().toISOString().split('T')[0];
    if (user.lastClaimDate !== today) {
      user.points += 10;
      user.lastClaimDate = today;
      
      // Streak Logic
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (user.lastLoginDate === yesterdayStr) {
        user.streak += 1;
      } else if (user.lastLoginDate !== today) {
        user.streak = 1;
      }
      
      user.lastLoginDate = today; // Add this field to model if needed or reuse lastClaimDate
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('username points level')
      .sort({ points: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/welcome-dismissed
router.post('/welcome-dismissed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.hasSeenWelcome = true;
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
