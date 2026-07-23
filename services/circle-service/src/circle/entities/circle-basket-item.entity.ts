import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * A line in the circle's pooled standing basket. Aggregated across members, this
 * is both the supplier-negotiation demand signal (do.md §5) and the source of the
 * circle co-purchase affinity fed into discovery Route B (docs/discovery-algorithm.md §3).
 */
@Entity()
@Index(['circleId', 'productId'])
export class CircleBasketItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  circleId: string;

  @Column()
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column()
  addedBy: string; // userId

  @CreateDateColumn()
  addedAt: Date;
}
