import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type AgreementStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

/**
 * An off-take agreement (do.md §5.1): a commitment to a minimum guaranteed
 * volume at a fixed/capped price over a 3–6 month term. Predictable demand
 * (standing baskets + circles) is the negotiating asset behind these.
 */
@Entity()
export class OffTakeAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supplierId: string;

  /** Either a specific product… */
  @Index()
  @Column({ nullable: true })
  productId: string;

  /** …or a category-level commitment. */
  @Column({ nullable: true })
  category: string;

  /** Minimum guaranteed units over the term. */
  @Column({ type: 'int', default: 0 })
  minVolumeUnits: number;

  /** Capped/fixed price (cents) for the term. */
  @Column({ type: 'int', default: 0 })
  cappedPriceCents: number;

  @Column({ type: 'int', default: 3 })
  termMonths: number;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: AgreementStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
