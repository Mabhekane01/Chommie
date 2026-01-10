import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    this.logger.log(`Sending Email to ${to}: [${subject}]`);
    // In production, integrate with SendGrid, AWS SES, or Mailchimp here
    return true;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`Sending SMS to ${to}: ${message}`);
    // In production, integrate with Twilio or BulkSMS here
    return true;
  }

  async sendOrderConfirmation(email: string, orderId: string, total: number) {
    const subject = `Order Confirmation #${orderId.slice(0, 8)}`;
    const body = `Thank you for your order! Your total is R${total}. Your order is being processed.`;
    return this.sendEmail(email, subject, body);
  }
}
