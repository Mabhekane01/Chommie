import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SupabaseAuthGuard,
  OptionalSupabaseAuthGuard,
  type AuthUser,
} from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { resolveActingUserId } from '../auth/dev-fallback';

/**
 * REST surface for buying circles (do.md §3.3). Translates HTTP into
 * circle-service TCP commands, same pattern as the other gateway controllers.
 */
@Controller('circles')
export class CirclesController {
  constructor(@Inject('CIRCLE_SERVICE') private readonly circleClient: ClientProxy) {}

  // Optional auth: a verified token always decides who is acting. A body userId
  // is honoured only under the local-dev escape hatch (the seed script) — in
  // production an unauthenticated caller cannot act as someone else.
  @UseGuards(OptionalSupabaseAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    const userId = resolveActingUserId(user?.id, data?.userId);
    if (!userId) throw new UnauthorizedException('Sign in to create a circle');
    return this.circleClient.send({ cmd: 'create_circle' }, { ...data, userId });
  }

  @UseGuards(OptionalSupabaseAuthGuard)
  @Post('join')
  join(@CurrentUser() user: AuthUser | undefined, @Body() data: any) {
    const userId = resolveActingUserId(user?.id, data?.userId);
    if (!userId) throw new UnauthorizedException('Sign in to join a circle');
    return this.circleClient.send({ cmd: 'join_circle' }, { ...data, userId });
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
    const userId = resolveActingUserId(user?.id, data?.userId);
    if (!userId) throw new UnauthorizedException('Sign in to add to a circle basket');
    return this.circleClient.send(
      { cmd: 'add_circle_basket_item' },
      { ...data, circleId: id, userId },
    );
  }

  @Get(':id/affinity')
  affinity(@Param('id') id: string) {
    return this.circleClient.send({ cmd: 'get_circle_affinity' }, { circleId: id });
  }

  // Requires a verified token: the circle-service checks the caller is an active
  // member of the circle the item belongs to before deleting anything.
  @UseGuards(SupabaseAuthGuard)
  @Delete('basket/:itemId')
  removeItem(@CurrentUser() user: AuthUser, @Param('itemId') itemId: string) {
    return this.circleClient.send(
      { cmd: 'remove_circle_basket_item' },
      { itemId, userId: user.id },
    );
  }
}
