const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Riddle = require('../models/Riddle');

// @route   GET api/games/riddles
router.get('/riddles', auth, async (req, res) => {
  try {
    const riddles = await Riddle.find({ isActive: true }).select('-answer');
    // Filter out riddles the user already solved
    const available = riddles.filter(r => !r.solvedBy.includes(req.user.id));
    res.json(available);
  } catch (err) { res.status(500).send('Server error'); }
});

// @route   POST api/games/riddles/solve
router.post('/riddles/solve', auth, async (req, res) => {
  const { riddleId, answer } = req.body;
  try {
    const riddle = await Riddle.findById(riddleId);
    if (!riddle || !riddle.isActive) return res.status(404).json({ message: 'اللغز غير موجود' });
    
    if (riddle.solvedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'لقد أجبت على هذا اللغز مسبقاً' });
    }

    if (riddle.answer.toLowerCase().trim() === answer.toLowerCase().trim()) {
      const user = await User.findById(req.user.id);
      user.points += riddle.rewardPoints;
      riddle.solvedBy.push(user._id);
      
      await Promise.all([user.save(), riddle.save()]);
      res.json({ success: true, reward: riddle.rewardPoints, points: user.points });
    } else {
      res.json({ success: false, message: 'إجابة خاطئة، حاول مرة أخرى!' });
    }
  } catch (err) { res.status(500).send('Server error'); }
});

// @route   POST api/games/spin
router.post('/spin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    if (user.lastSpinDate === today) {
      if (user.spinCount >= 2) {
        return res.status(400).json({ message: 'Daily spin limit reached' });
      }
      user.spinCount += 1;
    } else {
      user.lastSpinDate = today;
      user.spinCount = 1;
    }

    // Random reward logic
    const rewards = [10, 20, 50, 100, 200, 500, 0, 0]; // Points
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    user.points += reward;
    await user.save();

    res.json({ reward, points: user.points, spinCount: user.spinCount });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/games/tap
router.post('/tap', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    
    // 5 second cooldown for tap
    if (user.lastTapTime && (now - user.lastTapTime) < 5000) {
      return res.status(400).json({ message: 'Cooling down...' });
    }

    const reward = Math.floor(Math.random() * 5) + 1; // 1-5 points
    user.points += reward;
    user.lastTapTime = now;
    await user.save();

    res.json({ reward, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/games/predict
router.post('/predict', auth, async (req, res) => {
  try {
    const { bet, prediction } = req.body; // prediction: 'up' or 'down'
    const user = await User.findById(req.user.id);

    if (user.points < bet) return res.status(400).json({ message: 'Insufficient points' });

    // Simulated market result
    const result = Math.random() > 0.5 ? 'up' : 'down';
    const won = prediction === result;
    
    if (won) {
      user.points += bet; // 2x return
    } else {
      user.points -= bet;
    }

    await user.save();
    res.json({ won, result, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/games/scratch
router.post('/scratch', auth, async (req, res) => {
  try {
    const cost = 50;
    const user = await User.findById(req.user.id);
    if (user.points < cost) return res.status(400).json({ message: 'Insufficient points' });

    user.points -= cost;
    
    const winChance = Math.random();
    let reward = 0;
    if (winChance > 0.9) reward = 500;
    else if (winChance > 0.7) reward = 100;
    else if (winChance > 0.4) reward = 50;

    user.points += reward;
    await user.save();

    res.json({ reward, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
