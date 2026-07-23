import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AdsService } from './ads.service';

@Controller()
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @MessagePattern({ cmd: 'create_campaign' })
  create(@Payload() data: { advertiserId: string; productId: string; bidCents?: number; dailyBudgetCents?: number }) {
    return this.adsService.createCampaign(data);
  }

  @MessagePattern({ cmd: 'get_advertiser_campaigns' })
  advertiserCampaigns(@Payload() data: { advertiserId: string }) {
    return this.adsService.getAdvertiserCampaigns(data.advertiserId);
  }

  @MessagePattern({ cmd: 'pause_campaign' })
  pause(@Payload() data: { id: string }) {
    return this.adsService.pauseCampaign(data.id);
  }

  @MessagePattern({ cmd: 'get_active_sponsored' })
  activeSponsored() {
    return this.adsService.getActiveSponsored();
  }

  @EventPattern('ad_impression')
  impression(@Payload() data: { productId: string }) {
    return this.adsService.recordImpression(data.productId);
  }

  @EventPattern('ad_click')
  click(@Payload() data: { productId: string }) {
    return this.adsService.recordClick(data.productId);
  }
}
