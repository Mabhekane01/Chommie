import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('BNPL_SERVICE') private readonly bnplClient: ClientProxy,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.userService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    
    const newUser = await this.userService.create({
      ...registerDto,
      passwordHash,
    });
    
    // Automatically create Trust Profile in BNPL Service
    try {
      this.bnplClient.emit({ cmd: 'create_profile' }, { userId: newUser.id });
    } catch (error) {
      console.error('Failed to create trust profile:', error);
      // We don't fail registration if this fails, but we should log it
    }
    
    const { passwordHash: _, ...result } = newUser;
    return this.login(result);
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
        // We do not reveal if user exists for security
        return { message: 'If this email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userService.update(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires
    });

    // TODO: Send email via Notification Service
    console.log(`[MOCK EMAIL] Password Reset Link: http://localhost:4200/reset-password?token=${resetToken}`);

    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find user with this token and not expired
    // Since findOneByToken isn't in UserService, we might need to add it or fetch raw. 
    // Wait, TypeORM findOneBy accepts partial. 
    // BUT we also need to check expiry > now.
    // UserService.update logic is simple, but finding is specific.
    // Let's assume we fetch by token (needs UserService update) or just query roughly.
    // Actually, UserService doesn't expose findOneByToken. 
    
    // QUICK FIX: Add findOneByToken to UserService or do raw query.
    // I'll skip adding it to interface for speed and do it inefficiently? No.
    // I will add findOneByResetToken to UserService next.
    
    // Assuming it exists for this step:
    const user = await this.userService.findOneByResetToken(token);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Invalid or expired password reset token');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userService.update(user.id, {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
    });

    return { message: 'Password has been reset successfully.' };
  }

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
}