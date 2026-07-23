import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    const { email, orderId, totalAmount, userId } = data;
    await this.notificationsService.sendOrderConfirmation(email, orderId, totalAmount, userId);
  }

  @EventPattern('send_verification_otp')
  async handleSendVerificationOtp(@Payload() data: { email: string; otp: string }) {
    await this.notificationsService.sendVerificationOtp(data.email, data.otp);
  }

  @EventPattern('send_password_reset_otp')
  async handleSendPasswordResetOtp(@Payload() data: { email: string; otp: string }) {
    await this.notificationsService.sendPasswordResetOtp(data.email, data.otp);
  }

  @EventPattern('send_2fa_otp')
  async handleSend2FAOtp(@Payload() data: { email: string; otp: string }) {
    await this.notificationsService.send2FAOtp(data.email, data.otp);
  }

  @MessagePattern({ cmd: 'get_user_notifications' })
  async getUserNotifications(@Payload() data: { userId: string }) {
    return this.notificationsService.getUserNotifications(data.userId);
  }

  @MessagePattern({ cmd: 'mark_notification_read' })
  async markAsRead(@Payload() data: { id: string }) {
    return this.notificationsService.markAsRead(data.id);
  }

  @MessagePattern({ cmd: 'send_email' })
  async sendEmail(@Payload() data: { to: string; subject: string; body: string }) {
    return this.notificationsService.sendEmail(data.to, data.subject, data.body);
  }

  @MessagePattern({ cmd: 'send_sms' })
  async sendSms(@Payload() data: { to: string; message: string }) {
    return this.notificationsService.sendSms(data.to, data.message);
  }
}