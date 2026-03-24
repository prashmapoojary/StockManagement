const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Startup connection check
 */
const verifyMailer = async () => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'PLACEHOLDER_FOR_USER_KEY') {
       console.log('⚠️ RESEND_API_KEY is missing or using placeholder in .env');
       return;
    }
    console.log('✅ Mailer ready (Resend)');
  } catch (err) {
    console.error('❌ Mailer connection failed:', err.message);
  }
};

verifyMailer();

/**
 * Generic email sender using Resend
 */
const sendEmail = async ({ to, subject, html }) => {
  const senderEmail = process.env.NODE_ENV === 'production' ? 'noreply@yourdomain.com' : 'onboarding@resend.dev';

  const { data, error } = await resend.emails.send({
    from: senderEmail,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log(`📧 Email sent to ${to} | ID: ${data.id}`);
  return data;
};

/**
 * OTP Email sender — called from otpService.js
 */
const sendOTPEmail = async (toEmail, otp, type) => {
  const subjects = {
    LOGIN:          'Your WMS Login OTP',
    REGISTER:       'Verify Your WMS Account',
    RESET_PASSWORD: 'WMS Password Reset OTP',
  };

  const typeLabel = type.replace(/_/g, ' ');

  const html = `
    <div style="
      font-family: Georgia, serif;
      max-width: 480px;
      margin: 0 auto;
      background: #faf7f2;
      border: 1px solid #d4c5a9;
      border-radius: 4px;
      overflow: hidden;
    ">
      <!-- Header -->
      <div style="
        background: #8B6F47;
        padding: 24px;
        text-align: center;
      ">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          🏭 Warehouse Monitor
        </h1>
        <p style="color: #f0e6d3; margin: 6px 0 0; font-size: 13px;">
          Stock Management System
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <p style="color: #4a3728; font-size: 15px; margin-top: 0;">
          Hello,
        </p>
        <p style="color: #4a3728; font-size: 15px;">
          Your one-time password (OTP) for
          <strong>${typeLabel}</strong> is:
        </p>

        <!-- OTP Box -->
        <div style="
          background: #fff8ee;
          border: 2px dashed #c9a96e;
          border-radius: 4px;
          padding: 28px 20px;
          text-align: center;
          margin: 28px 0;
        ">
          <span style="
            font-family: 'Courier New', monospace;
            font-size: 44px;
            font-weight: bold;
            color: #8B6F47;
            letter-spacing: 14px;
          ">
            ${otp}
          </span>
        </div>

        <!-- Warning notes -->
        <div style="
          background: #fdf3e7;
          border-left: 3px solid #c9a96e;
          padding: 14px 16px;
          border-radius: 2px;
          margin-bottom: 20px;
        ">
          <p style="color: #7a6a5a; font-size: 13px; margin: 0; line-height: 1.8;">
            ⏱ This OTP expires in <strong>10 minutes</strong><br/>
            🔒 Never share this OTP with anyone<br/>
            ❌ If you did not request this, ignore this email
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        background: #ede8df;
        padding: 16px;
        text-align: center;
        border-top: 1px solid #d4c5a9;
      ">
        <p style="color: #9a8878; font-size: 12px; margin: 0;">
          © 2024 WMS Platform · All rights reserved
        </p>
      </div>
    </div>
  `;

  return await sendEmail({ to: toEmail, subject: subjects[type] || 'Your WMS OTP Code', html });
};

module.exports = { sendOTPEmail, sendEmail };
