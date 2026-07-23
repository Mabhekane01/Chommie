import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type BasketStatus = 'ACTIVE' | 'PAUSED';

/**
 * One standing staples basket per household (do.md §3.2) — the single recurring
 * relationship whose aggregate is the demand signal we take to suppliers, and the
 * source of discovery Route A (replenishment).
 */
@Entity()
export class StandingBasket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  userId: string;

  @Column({ type: 'varchar', default: 'MONTHLY' })
  cadence: string;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: BasketStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
