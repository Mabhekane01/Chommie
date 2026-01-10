import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TrustScoreModule } from './trust-score/trust-score.module';
import { TrustProfile } from './trust-score/entities/trust-profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'Ntando@postgresql!!522',
      database: process.env.POSTGRES_DB || 'chommie_db',
      entities: [TrustProfile],
      synchronize: true, // Auto-create tables (Dev only)
    }),
    TrustScoreModule,
  ],
})
export class AppModule {}