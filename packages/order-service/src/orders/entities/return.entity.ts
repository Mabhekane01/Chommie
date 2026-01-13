import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
  REFUNDED = 'REFUNDED'
}

export enum ReturnReason {
  DAMAGED = 'DAMAGED',
  WRONG_ITEM = 'WRONG_ITEM',
  NO_LONGER_NEEDED = 'NO_LONGER_NEEDED',
  BETTER_PRICE_AVAILABLE = 'BETTER_PRICE_AVAILABLE',
  DEFECTIVE = 'DEFECTIVE'
}

@Entity()
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  userId: string;

  @Column('json')
  items: {
    orderItemId: string;
    productId: string;
    quantity: number;
    reason: ReturnReason;
    condition: string;
  }[];

  @Column({
    type: 'simple-enum',
    enum: ReturnStatus,
    default: ReturnStatus.REQUESTED
  })
  status: ReturnStatus;

  @Column({ nullable: true })
  adminComment: string;

  @Column({ nullable: true })
  refundAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
