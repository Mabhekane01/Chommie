import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    const { email, orderId, totalAmount } = data;
    await this.notificationsService.sendOrderConfirmation(email, orderId, totalAmount);
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
