import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';
import { Transaction } from './payments/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'Ntando@postgresql!!522',
      database: process.env.POSTGRES_DB || 'chommie_db',
      entities: [Transaction],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    PaymentsModule,
  ],
})
export class AppModule {}
