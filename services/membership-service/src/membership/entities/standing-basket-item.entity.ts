import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/** A line in a household's standing basket (do.md §3.2). Keyed per (user, product). */
@Entity()
@Index(['userId', 'productId'], { unique: true })
export class StandingBasketItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  addedAt: Date;
}
