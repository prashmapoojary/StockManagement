require('dotenv').config();
const { sendOTPEmail } = require('./config/mailer');

(async () => {
  try {
    console.log('📤 Sending test OTP email via Resend...');
    // Replace the email below with your own email to test
    const testEmail = 'prashmapoojary@gmail.com'; 
    
    await sendOTPEmail(
      testEmail,
      '482910',
      'LOGIN'
    );
    console.log(`✅ SUCCESS — Check your inbox at ${testEmail}!`);
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    if (err.message.includes('PLACEHOLDER')) {
        console.log('👉 Tip: You need to add your Resend API Key to the server/.env file first!');
    }
  }
})();
