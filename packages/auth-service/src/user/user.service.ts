import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './user.entity';
import { AuditLog, AuditEventType } from './audit-log.entity';
import { VerificationCode, VerificationType } from './verification-code.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, updateData);
  }

  // --- Audit Logging ---
  async createAuditLog(data: { email: string, userId?: string, eventType: AuditEventType, metadata?: any, ipAddress?: string }) {
    const log = this.auditLogRepository.create({
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
    });
    return this.auditLogRepository.save(log);
  }

  // --- OTP Verification ---
  async generateOTP(email: string, type: VerificationType): Promise<string> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate previous codes for this email and type
    await this.verificationCodeRepository.update({ email, type, isUsed: false }, { isUsed: true });

    const verificationCode = this.verificationCodeRepository.create({
      email,
      code,
      type,
      expiresAt,
      isUsed: false
    });

    await this.verificationCodeRepository.save(verificationCode);
    return code;
  }

  async validateOTP(email: string, code: string, type: VerificationType): Promise<boolean> {
    const validCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date())
      }
    });

    if (validCode) {
      validCode.isUsed = true;
      await this.verificationCodeRepository.save(validCode);
      return true;
    }

    return false;
  }

  async isValidOTP(email: string, code: string, type: VerificationType): Promise<boolean> {
    const validCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date())
      }
    });

    return !!validCode;
  }

  // --- Address Management ---
  async addAddress(userId: string, address: any): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new Error('User not found');

    const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
    const addresses = user.addresses || [];
    
    if (address.isDefault) {
        addresses.forEach(a => a.isDefault = false);
    }
    
    addresses.push(newAddress);
    user.addresses = addresses;
    return this.usersRepository.save(user);
  }

  async removeAddress(userId: string, addressId: string): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new Error('User not found');

    if (user.addresses) {
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        return this.usersRepository.save(user);
    }
    return user;
  }
}