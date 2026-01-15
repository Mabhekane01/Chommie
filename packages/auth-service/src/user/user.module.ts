import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuditLog } from './audit-log.entity';
import { VerificationCode } from './verification-code.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuditLog, VerificationCode])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
