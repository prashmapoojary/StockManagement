const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If email credentials are missing, log to console for debugging
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n=================== MOCK EMAIL ===================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html}`);
    console.log('==================================================\n');
    return;
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"Warehouse Monitor" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.html.replace(/<[^>]*>?/gm, ''), // Simple html to text fallback
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ SMTP Error Detail:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('👉 TIP: You likely need a Gmail "App Password". See your Google Account settings.');
    }
    throw error; // Re-throw so the controller can handle it
  }
};

module.exports = sendEmail;
