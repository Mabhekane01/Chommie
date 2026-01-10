import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TrustTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

@Entity()
export class TrustProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string; // Link to Auth User

  @Column({ type: 'int', default: 0 })
  currentScore: number;

  @Column({ type: 'enum', enum: TrustTier, default: TrustTier.BRONZE })
  tier: TrustTier;

  // Factors for calculation (stored for quick access/caching)
  @Column({ type: 'int', default: 0 })
  totalPayments: number;

  @Column({ type: 'int', default: 0 })
  onTimePayments: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'float', default: 0 })
  averagePaymentDelayDays: number;

  @Column({ type: 'int', default: 0 })
  disputeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCalculatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500.00 })
  creditLimit: number;
}
