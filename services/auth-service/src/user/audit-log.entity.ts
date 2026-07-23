import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum AuditEventType {
  REGISTER_INITIATED = 'REGISTER_INITIATED',
  VERIFICATION_SENT = 'VERIFICATION_SENT',
  VERIFICATION_SUCCESS = 'VERIFICATION_SUCCESS',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED'
}

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: AuditEventType
  })
  eventType: AuditEventType;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;
}
