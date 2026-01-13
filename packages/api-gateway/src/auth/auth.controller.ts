import { Controller, Get, Post, Delete, Param, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
      throw new HttpException(e.message || 'Login failed', HttpStatus.UNAUTHORIZED);
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

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.client.send({ cmd: 'forgot_password' }, body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    const response = await firstValueFrom(this.client.send({ cmd: 'reset_password' }, body));
    if (response && response.status === 'error') {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Post('address')
  async addAddress(@Body() body: { userId: string; address: any }) {
    return this.client.send({ cmd: 'add_address' }, body);
  }

  @Delete('address/:userId/:addressId')
  async removeAddress(@Param('userId') userId: string, @Param('addressId') addressId: string) {
    return this.client.send({ cmd: 'remove_address' }, { userId, addressId });
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.client.send({ cmd: 'get_profile' }, { userId });
  }

  @Post('favorite-category')
  async updateFavoriteCategory(@Body() body: { userId: string; category: string }) {
    return this.client.send({ cmd: 'update_favorite_category' }, body);
  }
}
