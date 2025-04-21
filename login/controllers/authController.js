const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
const User = require('../models/userModel');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/mailer');
const UserSubscription = require('../models/userSubscriptionModel');


exports.register = async (req, res) => {
  const { email, phone, password, subscriptionLevel } = req.body;

  try {
      const existingUser = await User.findOne({
          where: { [Op.or]: [{ email }, { phone }] }
      });
      if (existingUser) return res.status(400).json({ msg: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ email, phone, password: hashedPassword });

      const token = jwt.sign(
          { id: newUser.id, subscriptionLevel },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
      );

      await UserSubscription.create({
          id: newUser.id,
          phone,
          subscriptionLevel,
          token
      });

      res.status(201).json({
          msg: 'User registered',
          user: newUser,
          subscriptionLevel,
          token
      });
  } catch (err) {
      res.status(500).json({ msg: err.message });
  }
};


exports.login = async (req, res) => {
    const { loginMethod, value, password } = req.body;

    try {
        const user = await User.findOne({
            where: loginMethod === 'email' ? { email: value } : { phone: value }
        });

        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });
       
        // console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
    const subscription = await UserSubscription.findOne({ where: { id: user.id } });

    const token = jwt.sign(
    { id: user.id, subscriptionLevel: subscription.subscriptionLevel },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
    );

    res.json({ token, subscriptionLevel: subscription.subscriptionLevel });

};

exports.forgotPassword = async (req, res) => {
  const { method, value } = req.body; // method = 'email' | 'phone'

  try {
    const user = await User.findOne({ where: method === 'email' ? { email: value } : { phone: value } });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (method === 'email') {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save();

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
      console.log(`Reset link: ${resetLink}`);

      await sendResetEmail(user.email, resetLink);
      return res.json({ msg: 'Password reset email sent' });
      
    }

    if (method === 'phone') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      // Simulate sending OTP (replace with Twilio or SMS provider)
      console.log(`Sending OTP ${otp} to phone: ${user.phone}`);
      return res.json({ msg: 'OTP sent to phone' });
    }

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.resetPasswordByEmail = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } } });
      if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });
  
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
  
      res.json({ msg: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };

  exports.resetPasswordByOTP = async (req, res) => {
    const { phone, otp, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ where: { phone, otpCode: otp, otpExpiry: { [Op.gt]: Date.now() } } });
      if (!user) return res.status(400).json({ msg: 'Invalid OTP or expired' });
  
      user.password = await bcrypt.hash(newPassword, 10);
      user.otpCode = null;
      user.otpExpiry = null;
      await user.save();
  
      res.json({ msg: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };
  
  

