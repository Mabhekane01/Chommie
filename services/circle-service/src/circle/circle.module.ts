import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircleService } from './circle.service';
import { CircleController } from './circle.controller';
import { Circle } from './entities/circle.entity';
import { CircleMember } from './entities/circle-member.entity';
import { CircleBasketItem } from './entities/circle-basket-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Circle, CircleMember, CircleBasketItem])],
  providers: [CircleService],
  controllers: [CircleController],
  exports: [CircleService],
})
export class CircleModule {}
