import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AdminGuard } from '../auth/admin.guard';

/**
 * REST surface for marketplace advertising (do.md §3.6). Sponsored placement is
 * confined to the discretionary tier — the ad-service rejects campaigns on staples.
 * Campaign management is admin-gated.
 */
@UseGuards(AdminGuard)
@Controller('ads')
export class AdsController {
  constructor(@Inject('AD_SERVICE') private readonly adClient: ClientProxy) {}

  @Post('campaigns')
  create(@Body() data: any) {
    return this.adClient.send({ cmd: 'create_campaign' }, data);
  }

  @Get('campaigns/:advertiserId')
  advertiserCampaigns(@Param('advertiserId') advertiserId: string) {
    return this.adClient.send({ cmd: 'get_advertiser_campaigns' }, { advertiserId });
  }

  @Post('campaigns/:id/pause')
  pause(@Param('id') id: string) {
    return this.adClient.send({ cmd: 'pause_campaign' }, { id });
  }
}
