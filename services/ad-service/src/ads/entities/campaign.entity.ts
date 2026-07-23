import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

/**
 * A sponsored-placement campaign (do.md §3.6). Advertising lives ONLY in the
 * discretionary marketplace tier — a campaign on a staple product is rejected at
 * creation, so ads can never buy into the staples core.
 */
@Entity()
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The advertiser — a supplier/manufacturer of discretionary goods (do.md §3.6). */
  @Column()
  advertiserId: string;

  @Index()
  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  category: string;

  /** Bid (cents) used to weight sponsored visibility in the marketplace tier. */
  @Column({ type: 'int', default: 0 })
  bidCents: number;

  @Column({ type: 'int', default: 0 })
  dailyBudgetCents: number;

  @Column({ type: 'int', default: 0 })
  spentCents: number;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: CampaignStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
