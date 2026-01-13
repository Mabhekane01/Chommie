import { Controller, Get, Post, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  @Get(':userId')
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationClient.send({ cmd: 'get_user_notifications' }, { userId });
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationClient.send({ cmd: 'mark_notification_read' }, { id });
  }
}
