import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type MemberRole = 'ADMIN' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'INVITED' | 'LEFT';

@Entity()
@Index(['circleId', 'userId'], { unique: true })
export class CircleMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  circleId: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', default: 'MEMBER' })
  role: MemberRole;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: MemberStatus;

  @CreateDateColumn()
  joinedAt: Date;
}
