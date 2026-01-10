import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
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
}