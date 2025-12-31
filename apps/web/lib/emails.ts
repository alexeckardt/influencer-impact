import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Initialize Resend with API key
if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovalEmail(
  to: string,
  firstName: string,
  tempPassword: string
) {
  // Read the HTML template
  const templatePath = path.join(
    process.cwd(),
    '/public/approval-email.html',
  );
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders with dynamic values
  const htmlContent = template
    .replace('{{firstName}}', firstName)
    .replace('{{email}}', to)
    .replace('{{tempPassword}}', tempPassword)
    .replace('{{appUrl}}', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Influencer Platform <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Application Has Been Approved!',
      html: htmlContent,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
}