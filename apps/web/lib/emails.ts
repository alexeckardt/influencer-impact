import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { APPROVAL_EMAIL_TEMPLATE } from './emailtemplates';

// Determine which email service to use
const USE_GMAIL = process.env.USE_GMAIL === 'true';

// Initialize Resend (for production)
let resend: Resend | null = null;
if (!USE_GMAIL) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not found, email sending may fail');
  } else {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
}

// Initialize Nodemailer (for Gmail)
let gmailTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;
if (USE_GMAIL) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables.');
  }
  
  gmailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  
  console.log('📧 Email configured to use Gmail:', process.env.GMAIL_USER);
} else {
  console.log('📧 Email configured to use Resend');
}

export async function sendApprovalEmail(
  to: string,
  firstName: string,
  tempPassword: string
) {
  console.log('📧 sendApprovalEmail: Starting email send process');
  console.log('📧 Using:', USE_GMAIL ? 'Gmail SMTP' : 'Resend');
  console.log('📧 Recipient:', to);
  console.log('📧 First Name:', firstName);
  
  // Replace placeholders with dynamic values
  const htmlContent = APPROVAL_EMAIL_TEMPLATE
    .replace('{{firstName}}', firstName)
    .replace('{{email}}', to)
    .replace('{{tempPassword}}', tempPassword)
    .replace('{{appUrl}}', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  console.log('📧 Template processed successfully');

  try {
    if (USE_GMAIL && gmailTransporter) {
      // Send via Gmail SMTP
      console.log('📧 Sending email via Gmail SMTP...');
      
      const info = await gmailTransporter.sendMail({
        from: `"Influencer Review Platform" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Your Application Has Been Approved!',
        html: htmlContent,
      });
      
      console.log('✅ Email sent successfully via Gmail!');
      console.log('📧 Message ID:', info.messageId);
      
      return { id: info.messageId };
    } else if (resend) {
      // Send via Resend
      console.log('📧 Sending email via Resend API...');
      
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Influencer Platform <onboarding@resend.dev>',
        to: [to],
        subject: 'Your Application Has Been Approved!',
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('✅ Email sent successfully via Resend!');
      console.log('📧 Email ID:', data?.id);
      
      return data;
    } else {
      throw new Error('No email service configured');
    }
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      to,
      firstName,
      service: USE_GMAIL ? 'Gmail' : 'Resend',
    });
    throw error;
  }
}