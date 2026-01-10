import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustScoreService } from './trust-score.service';
import { TrustScoreController } from './trust-score.controller';
import { TrustProfile } from './entities/trust-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrustProfile])],
  controllers: [TrustScoreController],
  providers: [TrustScoreService],
  exports: [TrustScoreService],
})
export class TrustScoreModule {}
