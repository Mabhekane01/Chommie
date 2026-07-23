import { Controller, Get, Post, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SupabaseAuthGuard,
  OptionalSupabaseAuthGuard,
  type AuthUser,
} from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * REST surface for buying circles (do.md §3.3). Translates HTTP into
 * circle-service TCP commands, same pattern as the other gateway controllers.
 */
@Controller('circles')
export class CirclesController {
  constructor(@Inject('CIRCLE_SERVICE') private readonly circleClient: ClientProxy) {}

  // Optional auth: when a Supabase token is present the userId comes from the
  // verified token (a client cannot spoof it); a body userId is only honoured as
  // a fallback for trusted server callers like the seed script during migration.
  @UseGuards(OptionalSupabaseAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.circleClient.send({ cmd: 'create_circle' }, { ...data, userId: user?.id ?? data.userId });
  }

  @UseGuards(OptionalSupabaseAuthGuard)
  @Post('join')
  join(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    return this.circleClient.send({ cmd: 'join_circle' }, { ...data, userId: user?.id ?? data.userId });
  }

  // Per-user route: requires a verified Supabase token; the user id comes from
  // the token, never the client. Declared before ':id' so "mine" isn't an id.
  @UseGuards(SupabaseAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.circleClient.send({ cmd: 'get_my_circles' }, { userId: user.id });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.circleClient.send({ cmd: 'get_circle' }, { circleId: id });
  }

  @Get(':id/basket')
  basket(@Param('id') id: string) {
    return this.circleClient.send({ cmd: 'get_circle_basket' }, { circleId: id });
  }

  @UseGuards(OptionalSupabaseAuthGuard)
  @Post(':id/basket')
  addItem(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string, @Body() data: any) {
    return this.circleClient.send(
      { cmd: 'add_circle_basket_item' },
      { ...data, circleId: id, userId: user?.id ?? data.userId },
    );
  }

  @Get(':id/affinity')
  affinity(@Param('id') id: string) {
    return this.circleClient.send({ cmd: 'get_circle_affinity' }, { circleId: id });
  }

  @Delete('basket/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.circleClient.send({ cmd: 'remove_circle_basket_item' }, { itemId });
  }
}
