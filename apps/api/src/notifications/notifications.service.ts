import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"ARTMS" <${this.config.get('SMTP_FROM') || 'no-reply@artms.app'}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }

  async sendWhatsApp(phone: string, message: string) {
    // TODO Phase 5: integrate WATI or Twilio WhatsApp API
    this.logger.log(`[WhatsApp STUB] To: ${phone} | Message: ${message}`);
  }

  async sendRentReminder(tenant: { email: string; phone: string; firstName: string }, amount: number, dueDate: Date, unitNumber: string, propertyName: string) {
    const html = `
      <h2>Rent Reminder</h2>
      <p>Dear ${tenant.firstName},</p>
      <p>Your rent of <strong>KES ${amount.toLocaleString()}</strong> for unit <strong>${unitNumber}</strong> at <strong>${propertyName}</strong> is due on <strong>${dueDate.toDateString()}</strong>.</p>
      <p>Please ensure payment is made on time to avoid late fees.</p>
      <br/><p>Thank you,<br/>Property Management Team</p>
    `;
    await this.sendEmail(tenant.email, `Rent Reminder — ${dueDate.toDateString()}`, html);
    await this.sendWhatsApp(tenant.phone, `Rent reminder: KES ${amount.toLocaleString()} due on ${dueDate.toDateString()} for unit ${unitNumber} at ${propertyName}.`);
  }
}
