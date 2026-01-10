import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
}
