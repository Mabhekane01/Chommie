import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Circle, CircleType, DiscountTier } from './entities/circle.entity';
import { CircleMember } from './entities/circle-member.entity';
import { CircleBasketItem } from './entities/circle-basket-item.entity';

interface CreateCircleDto {
  name: string;
  type?: CircleType;
  region?: string;
  userId: string;
  payoutCycle?: string;
}

@Injectable()
export class CircleService {
  constructor(
    @InjectRepository(Circle) private readonly circles: Repository<Circle>,
    @InjectRepository(CircleMember) private readonly members: Repository<CircleMember>,
    @InjectRepository(CircleBasketItem) private readonly items: Repository<CircleBasketItem>,
  ) {}

  /**
   * A larger circle is a larger, more reliable, more schedulable unit of demand,
   * so it earns a deeper discount tier (do.md §3.3). Household pricing is never
   * *worse* because of this — the tier only adds discount.
   */
  private tierFor(activeMembers: number): { tier: DiscountTier; pct: number } {
    if (activeMembers >= 11) return { tier: 'CIRCLE_GOLD', pct: 8 };
    if (activeMembers >= 6) return { tier: 'CIRCLE_SILVER', pct: 5 };
    if (activeMembers >= 3) return { tier: 'CIRCLE_BRONZE', pct: 3 };
    return { tier: 'INDIVIDUAL', pct: 0 };
  }

  private genInviteCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  async createCircle(data: CreateCircleDto) {
    const circle = this.circles.create({
      name: data.name,
      type: data.type ?? 'STOKVEL',
      region: data.region,
      createdBy: data.userId,
      inviteCode: this.genInviteCode(),
      payoutCycle: data.payoutCycle,
    });
    const saved = await this.circles.save(circle);
    await this.members.save(
      this.members.create({ circleId: saved.id, userId: data.userId, role: 'ADMIN', status: 'ACTIVE' }),
    );
    return this.getCircle(saved.id);
  }

  async joinCircle(data: { inviteCode: string; userId: string }) {
    const circle = await this.circles.findOne({
      where: { inviteCode: (data.inviteCode ?? '').toUpperCase() },
    });
    if (!circle) return { error: 'CIRCLE_NOT_FOUND' };

    const existing = await this.members.findOne({
      where: { circleId: circle.id, userId: data.userId },
    });
    if (existing) {
      if (existing.status !== 'ACTIVE') {
        existing.status = 'ACTIVE';
        await this.members.save(existing);
      }
    } else {
      await this.members.save(
        this.members.create({ circleId: circle.id, userId: data.userId, role: 'MEMBER', status: 'ACTIVE' }),
      );
    }
    await this.recomputeTier(circle.id);
    return this.getCircle(circle.id);
  }

  private async recomputeTier(circleId: string): Promise<void> {
    const count = await this.members.count({ where: { circleId, status: 'ACTIVE' } });
    const { tier, pct } = this.tierFor(count);
    await this.circles.update(circleId, { discountTier: tier, extraDiscountPct: pct });
  }

  async getCircle(circleId: string) {
    const circle = await this.circles.findOne({ where: { id: circleId } });
    if (!circle) return null;
    const members = await this.members.find({ where: { circleId, status: 'ACTIVE' } });
    const basket = await this.items.find({ where: { circleId } });
    return { ...circle, memberCount: members.length, members, basket };
  }

  async getMyCircles(userId: string) {
    const memberships = await this.members.find({ where: { userId, status: 'ACTIVE' } });
    const circleIds = memberships.map((m) => m.circleId);
    if (circleIds.length === 0) return [];
    const circles = await this.circles.find({ where: { id: In(circleIds) } });
    return Promise.all(
      circles.map(async (c) => ({
        ...c,
        memberCount: await this.members.count({ where: { circleId: c.id, status: 'ACTIVE' } }),
      })),
    );
  }

  async addBasketItem(data: { circleId: string; productId: string; quantity?: number; userId: string }) {
    const item = this.items.create({
      circleId: data.circleId,
      productId: data.productId,
      quantity: data.quantity ?? 1,
      addedBy: data.userId,
    });
    return this.items.save(item);
  }

  async removeBasketItem(data: { itemId: string }) {
    await this.items.delete(data.itemId);
    return { success: true };
  }

  async getCircleBasket(circleId: string) {
    return this.items.find({ where: { circleId } });
  }

  /**
   * sku → affinity (0..1) — circle co-purchase strength. This is the concrete
   * Route B signal consumed by the discovery engine (docs/discovery-algorithm.md §3).
   */
  async getCircleAffinity(circleId: string): Promise<Record<string, number>> {
    const items = await this.items.find({ where: { circleId } });
    if (items.length === 0) return {};
    const counts: Record<string, number> = {};
    for (const it of items) {
      counts[it.productId] = (counts[it.productId] ?? 0) + it.quantity;
    }
    const max = Math.max(...Object.values(counts));
    const affinity: Record<string, number> = {};
    for (const [sku, c] of Object.entries(counts)) {
      affinity[sku] = max > 0 ? c / max : 0;
    }
    return affinity;
  }

  /** Aggregate pooled circle-basket demand per product (do.md §5.4 negotiating asset). */
  async getProductDemand(): Promise<{ productId: string; quantity: number }[]> {
    const rows = await this.items
      .createQueryBuilder('i')
      .select('i.productId', 'productId')
      .addSelect('SUM(i.quantity)', 'quantity')
      .groupBy('i.productId')
      .getRawMany();
    return rows.map((r) => ({ productId: r.productId, quantity: Number(r.quantity) }));
  }
}
