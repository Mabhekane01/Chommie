import { Controller, Get, Post, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseAuthGuard, type AuthUser } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/** Notifications are per-user — identity from the verified token only. */
@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  @Get(':userId')
  getUserNotifications(@CurrentUser() user: AuthUser) {
    return this.notificationClient.send({ cmd: 'get_user_notifications' }, { userId: user.id });
  }

  @Post(':id/read')
  markAsRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notificationClient.send({ cmd: 'mark_notification_read' }, { id, userId: user.id });
  }
}
