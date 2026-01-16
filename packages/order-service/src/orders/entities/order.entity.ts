import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  EFT = 'EFT',
  BNPL = 'BNPL',
  ZAPPER = 'ZAPPER',
  SNAPSCAN = 'SNAPSCAN',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column({
    type: 'simple-enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({
    type: 'simple-enum',
    enum: PaymentMethod
  })
  paymentMethod: PaymentMethod;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ type: 'json', nullable: true })
  trackingHistory: { status: string, timestamp: Date, description: string }[];

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ default: 0 })
  pointsRedeemed: number;

  @Column({ default: false })
  isPlusOrder: boolean;

  @Column({ type: 'text', nullable: true })
  deliveryNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
