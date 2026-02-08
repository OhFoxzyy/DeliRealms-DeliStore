import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'DeliRealms <noreply@delirealms.net>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

const createModernEmailTemplate = (content: {
  heading: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.heading}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid #262626; border-radius: 12px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                      ${content.heading}
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: #a3a3a3;">
                      ${content.body}
                    </p>
                  </td>
                </tr>
                
                ${content.buttonText && content.buttonUrl ? `
                <!-- Button -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${content.buttonUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                            ${content.buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; border-top: 1px solid #262626; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #525252;">
                      ${content.footerText || 'This is an automated message from DeliRealms. Please do not reply to this email.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Bottom spacing -->
              <table width="600" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #404040;">
                      © ${new Date().getFullYear()} DeliRealms. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export async function sendLoginNotificationEmail(
  email: string,
  userName: string,
  ipAddress: string,
  userAgent: string
) {
  try {
    const html = createModernEmailTemplate({
      heading: 'New Login Detected',
      body: `Hello ${userName},<br><br>We detected a new login to your DeliRealms account.<br><br><strong>IP Address:</strong> ${ipAddress}<br><strong>Device:</strong> ${userAgent}<br><strong>Time:</strong> ${new Date().toLocaleString()}<br><br>If this wasn't you, please secure your account immediately.`,
      footerText: 'If you did not log in, please contact support immediately.',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'New Login to Your Account',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send login notification email:', error);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  try {
    const html = createModernEmailTemplate({
      heading: 'Verify Your Email',
      body: 'Thanks for signing up! Please click the button below to verify your email address and activate your account.',
      buttonText: 'Verify Email Address',
      buttonUrl: verificationUrl,
      footerText: 'If you did not create an account, you can safely ignore this email.',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - DeliRealms',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const html = createModernEmailTemplate({
      heading: 'Reset Your Password',
      body: 'You requested to reset your password. Click the button below to create a new password. This link will expire in 1 hour.',
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
      footerText: 'If you did not request this, please ignore this email and your password will remain unchanged.',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - DeliRealms',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendAbuseDetectionEmail(
  adminEmail: string,
  userId: string,
  userEmail: string,
  reason: string,
  details: string
) {
  try {
    const html = createModernEmailTemplate({
      heading: '⚠️ Abuse Detected',
      body: `Suspicious activity has been detected on the platform.<br><br><strong>User ID:</strong> ${userId}<br><strong>Email:</strong> ${userEmail}<br><strong>Reason:</strong> ${reason}<br><strong>Details:</strong> ${details}<br><br>Please review this user's activity immediately.`,
      buttonText: 'View Admin Dashboard',
      buttonUrl: `${APP_URL}/admin/users`,
      footerText: 'This is an automated security alert.',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: '⚠️ Abuse Detection Alert - DeliRealms',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send abuse detection email:', error);
  }
}

export async function sendAccountBannedEmail(
  email: string,
  userName: string,
  reason: string
) {
  try {
    const html = createModernEmailTemplate({
      heading: 'Account Suspended',
      body: `Hello ${userName},<br><br>Your DeliRealms account has been suspended due to violations of our terms of service.<br><br><strong>Reason:</strong> ${reason}<br><br>If you believe this is a mistake, please contact our support team.`,
      buttonText: 'Contact Support',
      buttonUrl: `${APP_URL}/support`,
      footerText: 'This decision was made to protect our community.',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Account Has Been Suspended - DeliRealms',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send account banned email:', error);
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  try {
    const html = createModernEmailTemplate({
      heading: 'Welcome to DeliRealms!',
      body: `Hello ${userName},<br><br>Welcome to DeliRealms! We're excited to have you on board. Start building amazing web experiences with our powerful page builder.<br><br>Get started by creating your first project and exploring all the features we have to offer.`,
      buttonText: 'Get Started',
      buttonUrl: `${APP_URL}/dashboard`,
      footerText: 'Happy building!',
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to DeliRealms!',
      html,
    });
  } catch (error) {
    console.error('[v0] Failed to send welcome email:', error);
  }
}
