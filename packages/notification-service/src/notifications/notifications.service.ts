import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Notification } from './entities/notification.entity';

// Force rebuild
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || 're_Ubrf9kzo_K7EAj1KSk1hmPZZmUaVCpHFm';
    this.fromEmail = this.configService.get<string>('RESEND_FROM') || 'noreply@notifications.bankhosa.com';
    this.resend = new Resend(apiKey);
  }

  async createNotification(data: { userId: string, title: string, message: string, type: string }) {
    this.logger.log(`Creating In-App Notification for ${data.userId}: ${data.title}`);
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10
    });
  }

  async markAsRead(id: string) {
    return this.notificationRepository.update(id, { isRead: true });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    this.logger.log(`Sending Email to ${to}: [${subject}]`);
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: body,
      });

      if (error) {
        this.logger.error(`Resend Error: ${JSON.stringify(error)}`);
        return false;
      }

      this.logger.log(`Email sent successfully: ${data?.id}`);
      return true;
    } catch (e) {
      this.logger.error(`Failed to send email: ${e.message}`);
      return false;
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`Sending SMS to ${to}: ${message}`);
    return true;
  }

  async sendOrderConfirmation(email: string, orderId: string, total: number, userId?: string) {
    const subject = `Order Confirmation #${orderId.slice(0, 8)}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #FF6D1F;">Order Confirmed!</h2>
        <p>Thank you for your order! Your total is <strong>R${total}</strong>.</p>
        <p>Your order ID is: <strong>${orderId}</strong></p>
        <p>Your order is being processed and will be shipped soon.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888;">&copy; 2026 Chommie.za. All rights reserved.</p>
      </div>
    `;
    
    if (userId) {
      await this.createNotification({
        userId,
        title: 'Order Confirmed',
        message: `Thank you for your order! Your total is R${total}.`,
        type: 'ORDER'
      });
    }

    return this.sendEmail(email, subject, message);
  }

  async sendVerificationOtp(email: string, otp: string) {
    const subject = `${otp} is your Chommie verification code`;
    const body = `
      <div style="font-family: 'Amazon Ember', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 40px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #222; font-size: 28px; margin: 0;">Chommie<span style="color: #FF6D1F;">.za</span></h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 20px;">Verify your new Chommie account</h2>
        <p style="font-size: 14px; line-height: 1.5;">To verify your email address, please use the following One-Time Password (OTP):</p>
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #666;">This code will expire in 15 minutes. Chommie will never ask you for this code over the phone or via text.</p>
        <p style="font-size: 14px; line-height: 1.5; color: #666;">If you did not request this code, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">&copy; 2026 Chommie.za Inc. or its affiliates. All rights reserved.</p>
      </div>
    `;
    return this.sendEmail(email, subject, body);
  }

  async sendPasswordResetOtp(email: string, otp: string) {
    const subject = `${otp} is your Chommie password reset code`;
    const body = `
      <div style="font-family: 'Amazon Ember', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 40px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #222; font-size: 28px; margin: 0;">Chommie<span style="color: #FF6D1F;">.za</span></h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 20px;">Password assistance</h2>
        <p style="font-size: 14px; line-height: 1.5;">To reset your password, enter this verification code when prompted:</p>
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #666;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">&copy; 2026 Chommie.za Inc. or its affiliates. All rights reserved.</p>
      </div>
    `;
    return this.sendEmail(email, subject, body);
  }

  async send2FAOtp(email: string, otp: string) {
    const subject = `${otp} is your Chommie verification code`;
    const body = `
      <div style="font-family: 'Amazon Ember', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 40px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
           <h1 style="color: #222; font-size: 28px; margin: 0;">Chommie<span style="color: #FF6D1F;">.za</span></h1>
        </div>
        <h2 style="font-size: 20px; font-weight: 500; margin-bottom: 20px;">Two-Step Verification</h2>
        <p style="font-size: 14px; line-height: 1.5;">For added security, please enter the following One-Time Password (OTP) to complete your sign-in:</p>
        <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #666;">This code will expire in 15 minutes. If you didn't try to sign in, please secure your account.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">&copy; 2026 Chommie.za Inc. or its affiliates. All rights reserved.</p>
      </div>
    `;
    return this.sendEmail(email, subject, body);
  }
}
