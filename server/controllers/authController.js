const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, storeOTP, verifyOTP, sendOTPEmail } = require('../services/otpService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'staff']
    );

    const token = generateToken(newUser.rows[0].id, newUser.rows[0].role);

    res.status(201).json({
      success: true,
      data: {
        user: newUser.rows[0],
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // New Robust OTP logic
    const otp = generateOTP();
    await storeOTP(email, otp, 'LOGIN');
    
    try {
      await sendOTPEmail(email, otp, 'LOGIN');
      res.json({
        success: true,
        message: 'OTP sent to registered email',
        requireOtp: true,
        email: user.rows[0].email
      });
    } catch (err) {
      console.error('Email error:', err);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    // Verify using the news service
    const verification = await verifyOTP(email, otp, 'LOGIN');
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: verification.message });
    }

    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = generateToken(user.rows[0].id, user.rows[0].role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email,
          role: user.rows[0].role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordOtp = async (req, res, next) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const email = user.rows[0].email;
    
    const otp = generateOTP();
    await storeOTP(email, otp, 'RESET_PASSWORD');
    await sendOTPEmail(email, otp, 'RESET_PASSWORD');

    res.json({ 
      success: true, 
      message: 'OTP sent for password update'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await db.query('SELECT id, name, email, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const updatedUser = await db.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role',
      [name, email, req.user.id]
    );

    res.json({
      success: true,
      data: updatedUser.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, otp } = req.body;

  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const email = user.rows[0].email;

    // Verify OTP using service
    const verification = await verifyOTP(email, otp, 'RESET_PASSWORD');
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: verification.message });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', 
      [hashedPassword, req.user.id]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verifyOtp, requestPasswordOtp, getMe, logout, updateProfile, updatePassword };
