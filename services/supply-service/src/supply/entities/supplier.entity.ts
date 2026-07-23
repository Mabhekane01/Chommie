import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type SupplierStatus = 'ACTIVE' | 'PAUSED';

/** A farmer/producer/manufacturer we source from directly (do.md §5). */
@Entity()
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  blackOwned: boolean;

  @Column({ default: false })
  localProducer: boolean;

  @Column({ nullable: true })
  region: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column({ type: 'float', default: 0.7 })
  reliabilityScore: number;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: SupplierStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
