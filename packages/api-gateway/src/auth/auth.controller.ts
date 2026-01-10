import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
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
}
