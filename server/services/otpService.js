const crypto = require('crypto');
const { sendOTPEmail } = require('../config/mailer');
const pool = require('../config/db');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in DB (invalidate old ones first)
const storeOTP = async (email, otp, type) => {
  // Invalidate previous unused OTPs for this email+type
  await pool.query(
    `UPDATE otp_verifications 
     SET is_used = true 
     WHERE email = $1 AND type = $2 AND is_used = false`,
    [email, type]
  );

  // Insert new OTP, expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query(
    `INSERT INTO otp_verifications (email, otp, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [email, otp, type, expiresAt]
  );
};

// Verify OTP from DB
const verifyOTP = async (email, otp, type) => {
  const result = await pool.query(
    `SELECT * FROM otp_verifications
     WHERE email = $1 AND type = $2 AND is_used = false
     ORDER BY created_at DESC LIMIT 1`,
    [email, type]
  );

  if (result.rows.length === 0) {
    return { valid: false, message: 'OTP not found or already used' };
  }

  const record = result.rows[0];

  // Check expiry
  if (new Date() > new Date(record.expires_at)) {
    return { valid: false, message: 'OTP has expired' };
  }

  // Check max attempts (3 tries max)
  if (record.attempts >= 3) {
    return { valid: false, message: 'Too many attempts. Request a new OTP' };
  }

  // Wrong OTP → increment attempts
  if (record.otp !== otp) {
    await pool.query(
      `UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`,
      [record.id]
    );
    return { valid: false, message: 'Invalid OTP' };
  }

  // Correct → mark as used
  await pool.query(
    `UPDATE otp_verifications SET is_used = true WHERE id = $1`,
    [record.id]
  );

  return { valid: true };
};

module.exports = { generateOTP, storeOTP, verifyOTP, sendOTPEmail };
