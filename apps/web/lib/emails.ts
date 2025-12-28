import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';

if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.SMTP_FROM
) {
    throw new Error('Missing required SMTP environment variables.');
}


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com"
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // SMTP username
    pass: process.env.SMTP_PASS, // SMTP password
  },
});

export async function sendApprovalEmail(
  to: string,
  firstName: string,
  tempPassword: string
) {
  // Read the HTML template
  const templatePath = path.join(
    process.cwd(),
    '/public/approval-email.html', // Adjusted path for monorepo setup
  );
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders with dynamic values
  const htmlContent = template
    .replace('{{firstName}}', firstName)
    .replace('{{email}}', to)
    .replace('{{tempPassword}}', tempPassword)
    .replace('{{appUrl}}', process.env.APP_URL || 'http://localhost:3000');

  await transporter.sendMail({
    from: `"Influencer Review Platform" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Your Application Has Been Approved!',
    html: htmlContent,
  });
}