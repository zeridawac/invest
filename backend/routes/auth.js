const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InviteCode = require('../models/InviteCode');

// @route   POST api/auth/register
// @desc    Register user with invite code
router.post('/register', async (req, res) => {
  const { username, password, inviteCode } = req.body;

  try {
    // Check invite code
    const codeDoc = await InviteCode.findOne({ code: inviteCode, isUsed: false });
    if (!codeDoc) {
      return res.status(400).json({ message: 'Invalid or used invite code' });
    }

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Mark invite code as used
    codeDoc.isUsed = true;
    codeDoc.usedBy = user._id;
    await codeDoc.save();

    // Create JWT
    const payload = { id: user._id, username: user.username, isAdmin: user.isAdmin };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBan) {
      return res.status(403).json({ message: 'Your account is banned' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, username: user.username, isAdmin: user.isAdmin };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
