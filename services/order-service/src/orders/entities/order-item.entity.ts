import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productImage: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /** Retail reference price at time of order — proves the saving (do.md §6). */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  retailPrice: number;

  @Column({ type: 'json', nullable: true })
  selectedVariants: Record<string, string>;

  @Column()
  supplierId: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;
}
