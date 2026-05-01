const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP verification email to a new user.
 * NOTE: On Resend free plan, FROM_EMAIL must be 'onboarding@resend.dev'
 * and recipient is restricted to your verified email unless you have a domain.
 */
const sendOTPEmail = async (toEmail, userName, otp) => {
  const { data, error } = await resend.emails.send({
    from: `NotesHub <${process.env.FROM_EMAIL}>`,
    to: [toEmail],
    subject: 'Verify your NotesHub account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6d28d9; font-size: 24px; margin: 0;">NotesHub</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Notes for Students</p>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 8px;">Welcome, ${userName}! 👋</h2>
        <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">
          Use the OTP below to verify your email address and activate your account.
          This code expires in <strong>15 minutes</strong>.
        </p>
        <div style="background: #6d28d9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="color: white; font-size: 40px; font-weight: 900; letter-spacing: 12px;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you didn't create a NotesHub account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(`Email send failed: ${JSON.stringify(error)}`);
  return data;
};

module.exports = { sendOTPEmail };
