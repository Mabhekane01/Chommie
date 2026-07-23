import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/** do.md §3.4 — the two customer types, priced and positioned differently. */
export type MemberType = 'HOUSEHOLD' | 'RESELLER';
export type MembershipStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

/**
 * A membership (do.md §3.1). Revenue comes from this flat fee, not from marking
 * up staples — the fee is the profit centre and should sit well below the
 * household's provable savings versus retail.
 */
@Entity()
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  userId: string;

  @Column({ type: 'varchar', default: 'HOUSEHOLD' })
  type: MemberType;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: MembershipStatus;

  /** Flat monthly membership fee in cents (ZAR). */
  @Column({ type: 'int', default: 9900 })
  monthlyFeeCents: number;

  @Column({ nullable: true })
  region: string;

  /** Running total of proven savings vs retail (cents) — the trust metric (do.md §6). */
  @Column({ type: 'int', default: 0 })
  savingsToDateCents: number;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
