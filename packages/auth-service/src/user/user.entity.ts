import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: 'CUSTOMER' })
  role: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', default: 'PENDING', nullable: true })
  vendorStatus: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'; // Vendor Vetting Status

  @Column({ type: 'text', nullable: true })
  verificationToken: string;

  @Column({ default: 0 })
  trustScore: number;

  @Column({ type: 'text', nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  storeName: string;

  @Column({ nullable: true, type: 'text' })
  storeDescription: string;

  @Column({ default: 0, type: 'float' })
  sellerRating: number;

  @Column({ default: 0 })
  numSellerRatings: number;

  @Column({ nullable: true })
  favoriteCategory: string;

  @Column({ type: 'json', nullable: true })
  addresses: {
      id: string;
      fullName: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone: string;
      isDefault: boolean;
  }[];

  @Column({ default: 0 })
  rewardPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
