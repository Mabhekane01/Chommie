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
