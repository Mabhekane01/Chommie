import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TrustScoreModule } from './trust-score/trust-score.module';
import { PaymentPlanModule } from './payment-plan/payment-plan.module';
import { TrustProfile } from './trust-score/entities/trust-profile.entity';
import { PaymentPlan } from './payment-plan/entities/payment-plan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'Ntando@postgresql!!522',
      database: process.env.POSTGRES_DB || 'chommie_db',
      entities: [TrustProfile, PaymentPlan],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TrustScoreModule,
    PaymentPlanModule,
  ],
})
export class AppModule {}