import { Controller, Get, Post, Delete, Param, Body, Inject, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SupabaseAuthGuard, type AuthUser } from './supabase-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      const response = await firstValueFrom(this.client.send({ cmd: 'login' }, body));
      if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.UNAUTHORIZED);
      }
      return response;
    } catch (e) {
      console.error('Login Gateway Error:', e);
      if (e instanceof HttpException) throw e;
      throw new HttpException(e.message || 'Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      const response = await firstValueFrom(this.client.send({ cmd: 'register' }, body));
      if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
      }
      return response;
    } catch (e) {
        throw new HttpException(e.message || 'Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string, otp: string }) {
    try {
      const response = await firstValueFrom(this.client.send({ cmd: 'verify_otp' }, body));
      if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
      }
      return response;
    } catch (e) {
        throw new HttpException(e.message || 'Verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-2fa')
  async verify2FA(@Body() body: { email: string, otp: string }) {
    try {
      const response = await firstValueFrom(this.client.send({ cmd: 'verify_2fa' }, body));
      if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
      }
      return response;
    } catch (e) {
        throw new HttpException(e.message || '2FA Verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.client.send({ cmd: 'request_email_verification' }, body);
  }

  @Post('request-email-verification')
  async requestEmailVerification(@Body() body: { email: string }) {
    return this.client.send({ cmd: 'request_email_verification' }, body);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('toggle-2fa')
  async toggle2FA(@CurrentUser() user: AuthUser, @Body() body: { enabled: boolean }) {
    return this.client.send({ cmd: 'toggle_2fa' }, { userId: user.id, enabled: body.enabled });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.client.send({ cmd: 'forgot_password' }, body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otp: string; password: any }) {
    const response = await firstValueFrom(this.client.send({ cmd: 'reset_password' }, body));
    if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  // --- Authenticated: identity always from the verified token ---

  @UseGuards(SupabaseAuthGuard)
  @Post('address')
  async addAddress(@CurrentUser() user: AuthUser, @Body() body: { address: any }) {
    return this.client.send({ cmd: 'add_address' }, { userId: user.id, address: body.address });
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('address/:userId/:addressId')
  async removeAddress(@CurrentUser() user: AuthUser, @Param('addressId') addressId: string) {
    return this.client.send({ cmd: 'remove_address' }, { userId: user.id, addressId });
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('profile/:userId')
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.client.send({ cmd: 'get_profile' }, { userId: user.id });
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('favorite-category')
  async updateFavoriteCategory(@CurrentUser() user: AuthUser, @Body() body: { category: string }) {
    return this.client.send({ cmd: 'update_favorite_category' }, { userId: user.id, category: body.category });
  }
}