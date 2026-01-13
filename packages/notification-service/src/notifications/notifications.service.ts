import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

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
    return true;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    this.logger.log(`Sending SMS to ${to}: ${message}`);
    return true;
  }

  async sendOrderConfirmation(email: string, orderId: string, total: number, userId?: string) {
    const subject = `Order Confirmation #${orderId.slice(0, 8)}`;
    const message = `Thank you for your order! Your total is R${total}. Your order is being processed.`;
    
    if (userId) {
      await this.createNotification({
        userId,
        title: 'Order Confirmed',
        message,
        type: 'ORDER'
      });
    }

    return this.sendEmail(email, subject, message);
  }
}
