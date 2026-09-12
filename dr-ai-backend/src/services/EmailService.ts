import { config } from '../config/env';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}

class ConsoleEmailService implements EmailService {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (config.NODE_ENV !== 'test') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📨 [MOCK EMAIL SERVICE] Email dispatched:`);
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content:\n${options.text}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    return true;
  }
}

// In-memory test store for assertions in test suites
export class TestEmailService implements EmailService {
  public sentEmails: SendEmailOptions[] = [];

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    this.sentEmails.push(options);
    return true;
  }

  clear(): void {
    this.sentEmails = [];
  }
}

export const emailService: EmailService =
  config.NODE_ENV === 'test' ? new TestEmailService() : new ConsoleEmailService();
