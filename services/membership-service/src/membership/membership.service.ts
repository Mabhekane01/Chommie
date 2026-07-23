import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership, MemberType, MembershipStatus } from './entities/membership.entity';
import { StandingBasket, BasketStatus } from './entities/standing-basket.entity';
import { StandingBasketItem } from './entities/standing-basket-item.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership) private readonly memberships: Repository<Membership>,
    @InjectRepository(StandingBasket) private readonly baskets: Repository<StandingBasket>,
    @InjectRepository(StandingBasketItem) private readonly items: Repository<StandingBasketItem>,
  ) {}

  /** Household fee sits below provable savings; reseller pays more for wholesale-tier access. */
  private feeFor(type: MemberType): number {
    return type === 'RESELLER' ? 29900 : 9900;
  }

  private async ensureBasket(userId: string): Promise<StandingBasket> {
    let basket = await this.baskets.findOne({ where: { userId } });
    if (!basket) {
      basket = await this.baskets.save(this.baskets.create({ userId }));
    }
    return basket;
  }

  async join(data: { userId: string; type?: MemberType; region?: string }) {
    const type = data.type ?? 'HOUSEHOLD';
    let m = await this.memberships.findOne({ where: { userId: data.userId } });
    if (!m) {
      m = this.memberships.create({
        userId: data.userId,
        type,
        region: data.region,
        monthlyFeeCents: this.feeFor(type),
        status: 'ACTIVE',
      });
    } else {
      m.status = 'ACTIVE';
      if (data.type) {
        m.type = data.type;
        m.monthlyFeeCents = this.feeFor(data.type);
      }
      if (data.region) m.region = data.region;
    }
    await this.memberships.save(m);
    await this.ensureBasket(data.userId);
    return this.get(data.userId);
  }

  async get(userId: string) {
    const membership = await this.memberships.findOne({ where: { userId } });
    if (!membership) return null;
    return { ...membership, standingBasket: await this.getBasket(userId) };
  }

  async setStatus(data: { userId: string; status: MembershipStatus }) {
    await this.memberships.update({ userId: data.userId }, { status: data.status });
    return this.get(data.userId);
  }

  async getBasket(userId: string) {
    const basket = await this.baskets.findOne({ where: { userId } });
    const items = await this.items.find({ where: { userId }, order: { addedAt: 'ASC' } });
    return { basket, items };
  }

  async setItem(data: { userId: string; productId: string; quantity?: number }) {
    const q = Math.max(0, data.quantity ?? 1);
    const existing = await this.items.findOne({
      where: { userId: data.userId, productId: data.productId },
    });
    if (q === 0) {
      if (existing) await this.items.delete(existing.id);
    } else if (existing) {
      existing.quantity = q;
      await this.items.save(existing);
    } else {
      await this.items.save(
        this.items.create({ userId: data.userId, productId: data.productId, quantity: q }),
      );
    }
    await this.ensureBasket(data.userId);
    return this.getBasket(data.userId);
  }

  async removeItem(data: { userId: string; itemId: string }) {
    await this.items.delete({ id: data.itemId, userId: data.userId });
    return this.getBasket(data.userId);
  }

  async setBasketStatus(data: { userId: string; status: BasketStatus }) {
    await this.ensureBasket(data.userId);
    await this.baskets.update({ userId: data.userId }, { status: data.status });
    return this.getBasket(data.userId);
  }

  /** Product ids in the member's standing basket — feeds discovery Route A (replenishment). */
  async getBasketSkus(userId: string): Promise<string[]> {
    const items = await this.items.find({ where: { userId } });
    return items.map((i) => i.productId);
  }

  /**
   * Accrue proven savings vs retail to the member's running total (do.md §6).
   * This is the trust metric — savings must be provably larger than the fee.
   * No-ops for non-members (nothing to increment).
   */
  async accrueSavings(userId: string, cents: number): Promise<void> {
    if (!userId || !cents || cents <= 0) return;
    await this.memberships.increment({ userId }, 'savingsToDateCents', Math.round(cents));
  }

  /**
   * Aggregate standing-basket demand per product — the forecastable-demand
   * negotiating asset (do.md §5.4) consumed by the supply service.
   */
  async getProductDemand(): Promise<{ productId: string; quantity: number; members: number }[]> {
    const rows = await this.items
      .createQueryBuilder('i')
      .select('i.productId', 'productId')
      .addSelect('SUM(i.quantity)', 'quantity')
      .addSelect('COUNT(DISTINCT i.userId)', 'members')
      .groupBy('i.productId')
      .getRawMany();
    return rows.map((r) => ({
      productId: r.productId,
      quantity: Number(r.quantity),
      members: Number(r.members),
    }));
  }
}
