import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type CircleType = 'FAMILY' | 'STREET' | 'WORKPLACE' | 'STOKVEL';
export type DiscountTier = 'INDIVIDUAL' | 'CIRCLE_BRONZE' | 'CIRCLE_SILVER' | 'CIRCLE_GOLD';

/**
 * A buying circle — the digitized stokvel (do.md §3.3). Households pool their
 * standing-basket demand into one schedulable unit, unlocking a deeper discount tier.
 */
@Entity()
export class Circle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'STOKVEL' })
  type: CircleType;

  /** Region/township for geo-aware supply & discovery (do.md §3.5). */
  @Column({ nullable: true })
  region: string;

  @Column()
  createdBy: string; // userId of the founding admin

  @Index({ unique: true })
  @Column()
  inviteCode: string;

  @Column({ type: 'varchar', default: 'INDIVIDUAL' })
  discountTier: DiscountTier;

  /** Extra discount (percentage points) unlocked by the circle's size/reliability. */
  @Column({ type: 'float', default: 0 })
  extraDiscountPct: number;

  /** Payout/pooling cadence, e.g. 'MONTH_END', 'YEAR_END' (stokvel cycle). */
  @Column({ nullable: true })
  payoutCycle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
