import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MembershipModule } from './membership/membership.module';
import { Membership } from './membership/entities/membership.entity';
import { StandingBasket } from './membership/entities/standing-basket.entity';
import { StandingBasketItem } from './membership/entities/standing-basket-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'chommie_db',
      entities: [Membership, StandingBasket, StandingBasketItem],
      synchronize: process.env.DB_SYNCHRONIZE ? process.env.DB_SYNCHRONIZE === 'true' : process.env.NODE_ENV !== 'production',
    }),
    MembershipModule,
  ],
})
export class AppModule {}
