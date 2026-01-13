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

  @Column({ default: 0 })
  trustScore: number;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
