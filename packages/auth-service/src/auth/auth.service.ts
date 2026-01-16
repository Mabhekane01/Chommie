import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { AuditEventType } from '../user/audit-log.entity';
import { VerificationType } from '../user/verification-code.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('BNPL_SERVICE') private readonly bnplClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      await this.userService.createAuditLog({ email, eventType: AuditEventType.LOGIN_FAILED, metadata: { reason: 'User not found' } });
      return null;
    }

    if (!user.isVerified && !user.isTwoFactorEnabled) {
        await this.userService.createAuditLog({ email, userId: user.id, eventType: AuditEventType.LOGIN_FAILED, metadata: { reason: 'Account not verified' } });
        throw new BadRequestException('Please verify your email address before signing in.');
    }

    if (await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      await this.userService.createAuditLog({ email, userId: user.id, eventType: AuditEventType.LOGIN_SUCCESS });
      return result;
    }

    await this.userService.createAuditLog({ email, userId: user.id, eventType: AuditEventType.LOGIN_FAILED, metadata: { reason: 'Invalid password' } });
    return null;
  }

  async login(user: any) {
    // If 2FA is enabled, don't return tokens yet
    if (user.isTwoFactorEnabled) {
        const otp = await this.userService.generateOTP(user.email, VerificationType.TWO_FACTOR_AUTH);
        this.notificationClient.emit('send_2fa_otp', { email: user.email, otp });
        
        return {
            status: '2fa_required',
            email: user.email,
            message: 'Two-Step Verification is enabled. A code has been sent to your email.'
        };
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  // --- REGISTRATION FLOW ---

  async requestEmailVerification(email: string): Promise<{ message: string }> {
    const existingUser = await this.userService.findOneByEmail(email);
    
    // If user exists but is NOT verified, we should resend the OTP so they can complete registration
    if (existingUser && !existingUser.isVerified) {
        const otp = await this.userService.generateOTP(email, VerificationType.EMAIL_VERIFICATION);
        this.notificationClient.emit('send_verification_otp', { email, otp });
        return { message: 'Verification code sent.' };
    }

    if (existingUser) {
      return { message: 'Verification code sent if account does not exist.' };
    }

    const otp = await this.userService.generateOTP(email, VerificationType.EMAIL_VERIFICATION);

    await this.userService.createAuditLog({
      email,
      eventType: AuditEventType.REGISTER_INITIATED,
      metadata: { action: 'OTP_GENERATED' }
    });

    this.notificationClient.emit('send_verification_otp', { email, otp });

    return { message: 'Verification code sent if account does not exist.' };
  }

  async register(registerDto: any) {
    const { email, password, otp, ...otherData } = registerDto;

    const isValid = await this.userService.validateOTP(email, otp, VerificationType.EMAIL_VERIFICATION);
    if (!isValid) {
      await this.userService.createAuditLog({ email, eventType: AuditEventType.VERIFICATION_FAILED, metadata: { reason: 'Invalid or expired OTP' } });
      throw new BadRequestException('Invalid or expired verification code');
    }

    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = await this.userService.create({
      ...otherData,
      email,
      passwordHash,
      isVerified: true,
      role: otherData.role || 'CUSTOMER',
      vendorStatus: otherData.role === 'VENDOR' ? 'PENDING' : undefined
    });
    
    try {
      this.bnplClient.emit({ cmd: 'create_profile' }, { userId: newUser.id });
    } catch (error) {
      console.error('Failed to create trust profile:', error);
    }

    await this.userService.createAuditLog({ email, userId: newUser.id, eventType: AuditEventType.VERIFICATION_SUCCESS });
    
    const { passwordHash: _, ...result } = newUser;
    return this.login(result);
  }

  async verifyOtp(data: { email: string, otp: string }) {
    // Check if OTP is valid but do NOT consume it yet (consume on register)
    const isValid = await this.userService.isValidOTP(data.email, data.otp, VerificationType.EMAIL_VERIFICATION);
    if (!isValid) {
        throw new BadRequestException('Invalid or expired verification code');
    }
    return { success: true, message: 'Verification code is valid.' };
  }

  // --- 2FA FLOW ---

  async verify2FA(data: { email: string, otp: string }) {
    const isValid = await this.userService.validateOTP(data.email, data.otp, VerificationType.TWO_FACTOR_AUTH);
    if (!isValid) {
        throw new BadRequestException('Invalid or expired verification code');
    }

    const user = await this.userService.findOneByEmail(data.email);
    if (!user) throw new NotFoundException('User not found');

    const payload = { email: user.email, sub: user.id, role: user.role };
    const { passwordHash: _, ...result } = user;
    
    return {
        accessToken: this.jwtService.sign(payload),
        user: result,
    };
  }

  async toggle2FA(userId: string, enabled: boolean) {
    await this.userService.update(userId, { isTwoFactorEnabled: enabled });
    return { success: true, isTwoFactorEnabled: enabled };
  }

  // --- PASSWORD RESET FLOW ---

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
        return { message: 'If this email exists, a verification code has been sent.' };
    }

    const otp = await this.userService.generateOTP(email, VerificationType.PASSWORD_RESET);

    await this.userService.createAuditLog({
      email,
      userId: user.id,
      eventType: AuditEventType.PASSWORD_RESET_REQUESTED
    });

    this.notificationClient.emit('send_password_reset_otp', { email, otp });

    return { message: 'If this email exists, a verification code has been sent.' };
  }

  async resetPassword(data: { email: string, otp: string, password: any }): Promise<{ message: string }> {
    const { email, otp, password } = data;

    const isValid = await this.userService.validateOTP(email, otp, VerificationType.PASSWORD_RESET);
    if (!isValid) {
        throw new BadRequestException('Invalid or expired verification code');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    await this.userService.update(user.id, { passwordHash });

    await this.userService.createAuditLog({
      email,
      userId: user.id,
      eventType: AuditEventType.PASSWORD_RESET_SUCCESS
    });

    return { message: 'Password has been reset successfully.' };
  }

  // --- USER PROFILE & ADDRESSES ---

  async addAddress(userId: string, address: any) {
    const updatedUser = await this.userService.addAddress(userId, address);
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  async removeAddress(userId: string, addressId: string) {
    const updatedUser = await this.userService.removeAddress(userId, addressId);
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async updateProfile(data: any) {
    const { userId, ...updateData } = data;
    await this.userService.update(userId, updateData);
    return this.getProfile(userId);
  }

  async updateFavoriteCategory(userId: string, category: string) {
    await this.userService.update(userId, { favoriteCategory: category });
    return { success: true };
  }

  async updateSellerStats(data: { vendorId: string; rating: number; numRatings: number }) {
    await this.userService.update(data.vendorId, {
      sellerRating: data.rating,
      numSellerRatings: data.numRatings
    });
  }

  async getPendingVendors() {
    return this.userService.findPendingVendors();
  }

  async updateVendorStatus(userId: string, status: string) {
    return this.userService.update(userId, { vendorStatus: status as any });
  }
}
