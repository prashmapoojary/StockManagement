const db = require('./config/db');

const migrate = async () => {
  try {
    console.log('Adding OTP columns to users table...');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code TEXT');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
};

migrate();
