const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, verifyOtp, requestPasswordOtp, getMe, logout, updateProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Max 3 OTP requests per 15 minutes per IP
const otpRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Try again in 15 minutes.' }
});

// Max 5 verify attempts per 15 minutes per IP
const otpVerifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many verification attempts.' }
});

router.post('/register', register);
router.post('/login', otpRequestLimit, login);
router.post('/verify-otp', otpVerifyLimit, verifyOtp);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.put('/profile', protect, updateProfile);
router.post('/request-password-otp', protect, otpRequestLimit, requestPasswordOtp);
router.put('/password', protect, updatePassword);

module.exports = router;
