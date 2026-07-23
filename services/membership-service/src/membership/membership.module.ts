import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { Membership } from './entities/membership.entity';
import { StandingBasket } from './entities/standing-basket.entity';
import { StandingBasketItem } from './entities/standing-basket-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, StandingBasket, StandingBasketItem])],
  providers: [MembershipService],
  controllers: [MembershipController],
  exports: [MembershipService],
})
export class MembershipModule {}
