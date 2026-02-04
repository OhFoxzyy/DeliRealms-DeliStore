import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  try {
    await resend.emails.send({
      from: 'vixle <noreply@vixle.app>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Verify your email</h1>
          <p style="color: #666; line-height: 1.6;">
            Thanks for signing up! Please click the link below to verify your email address:
          </p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
