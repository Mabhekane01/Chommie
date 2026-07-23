import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { Campaign } from './entities/campaign.entity';

const STAPLE_HINTS = [
  'staple', 'grocer', 'food', 'pantry', 'essential', 'egg', 'maize', 'mealie',
  'rice', 'oil', 'sugar', 'flour', 'dairy', 'milk', 'legume', 'bean', 'samp',
];

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    @InjectRepository(Campaign) private readonly campaigns: Repository<Campaign>,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  /** Guardrail: staples core is never pay-to-rank (do.md §3.6). */
  private isStaple(product: any): boolean {
    if (product?.isStaple === true) return true;
    const hay = `${product?.name ?? ''} ${product?.category ?? ''}`.toLowerCase();
    return STAPLE_HINTS.some((k) => hay.includes(k));
  }

  async createCampaign(data: {
    advertiserId: string;
    productId: string;
    bidCents?: number;
    dailyBudgetCents?: number;
  }) {
    const product: any = await lastValueFrom(
      this.productClient.send({ cmd: 'findOneProduct' }, data.productId).pipe(timeout(3000)),
    ).catch(() => null);

    if (!product) return { error: 'PRODUCT_NOT_FOUND' };
    if (this.isStaple(product)) {
      return {
        error: 'STAPLES_NOT_ELIGIBLE',
        message:
          'Advertising cannot buy placement in the staples core — sponsored slots are marketplace-tier only (do.md §3.6).',
      };
    }

    const campaign = this.campaigns.create({
      advertiserId: data.advertiserId,
      productId: String(product._id ?? product.id ?? data.productId),
      productName: product.name,
      category: product.category,
      bidCents: Math.max(0, data.bidCents ?? 0),
      dailyBudgetCents: Math.max(0, data.dailyBudgetCents ?? 0),
      status: 'ACTIVE',
    });
    return this.campaigns.save(campaign);
  }

  async getAdvertiserCampaigns(advertiserId: string) {
    return this.campaigns.find({ where: { advertiserId }, order: { createdAt: 'DESC' } });
  }

  async pauseCampaign(id: string) {
    await this.campaigns.update(id, { status: 'PAUSED' });
    return this.campaigns.findOne({ where: { id } });
  }

  /** Active sponsored products (marketplace tier only) for the discovery engine. */
  async getActiveSponsored(): Promise<{ productId: string; bidCents: number }[]> {
    const active = await this.campaigns.find({ where: { status: 'ACTIVE' } });
    return active
      .filter((c) => c.dailyBudgetCents === 0 || c.spentCents < c.dailyBudgetCents)
      .map((c) => ({ productId: c.productId, bidCents: c.bidCents }));
  }

  async recordImpression(productId: string) {
    await this.campaigns.increment({ productId, status: 'ACTIVE' }, 'impressions', 1);
    return { ok: true };
  }

  async recordClick(productId: string) {
    await this.campaigns.increment({ productId, status: 'ACTIVE' }, 'clicks', 1);
    return { ok: true };
  }
}
