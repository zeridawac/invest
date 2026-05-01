const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// @route   POST api/coupons/redeem
router.post('/redeem', auth, async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ message: 'الكوبون غير صحيح أو منتهي الصلاحية' });

    if (coupon.usedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'لقد استعملت هذا الكوبون مسبقاً' });
    }

    if (coupon.usedBy.length >= coupon.maxUses) {
      return res.status(400).json({ message: 'وصل هذا الكوبون للحد الأقصى من الاستخدام' });
    }

    const user = await User.findById(req.user.id);
    user.points += coupon.rewardPoints;
    coupon.usedBy.push(user._id);

    await user.save();
    await coupon.save();

    res.json({ message: `مبروك! حصلت على ${coupon.rewardPoints} كوين`, points: user.points });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
