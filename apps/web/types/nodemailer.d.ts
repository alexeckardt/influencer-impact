declare module 'nodemailer' {
  import { Transporter } from 'nodemailer';

  export interface SentMessageInfo {
    accepted: string[];
    rejected: string[];
    envelopeTime: number;
    messageTime: number;
    messageSize: number;
    response: string;
    envelope: {
      from: string;
      to: string[];
    };
    messageId: string;
  }

  export interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }

  // eslint-disable-next-line
  export function createTransport(options: TransportOptions): Transporter;

  export interface Transporter {
    // eslint-disable-next-line
    sendMail(mailOptions: MailOptions): Promise<SentMessageInfo>;
  }

  export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }
}