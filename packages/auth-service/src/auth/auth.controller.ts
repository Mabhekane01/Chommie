import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) {
      return { status: 'error', message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: any) {
    try {
      return await this.authService.register(data);
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  @MessagePattern({ cmd: 'validate_token' })
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(@Payload() data: { token: string; password: string }) {
    try {
        return await this.authService.resetPassword(data.token, data.password);
    } catch (e: any) {
        return { status: 'error', message: e.message };
    }
  }

  @MessagePattern({ cmd: 'add_address' })
  async addAddress(@Payload() data: { userId: string; address: any }) {
    return this.authService.addAddress(data.userId, data.address);
  }

  @MessagePattern({ cmd: 'remove_address' })
  async removeAddress(@Payload() data: { userId: string; addressId: string }) {
    return this.authService.removeAddress(data.userId, data.addressId);
  }

  @MessagePattern({ cmd: 'get_profile' })
  async getProfile(@Payload() data: { userId: string }) {
    return this.authService.getProfile(data.userId);
  }

  @MessagePattern({ cmd: 'update_favorite_category' })
  async updateFavoriteCategory(@Payload() data: { userId: string; category: string }) {
    return this.authService.updateFavoriteCategory(data.userId, data.category);
  }

  @EventPattern('update_seller_stats')
  async updateSellerStats(@Payload() data: any) {
    return this.authService.updateSellerStats(data);
  }
}
