import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CircleService } from './circle.service';
import type { CircleType } from './entities/circle.entity';

@Controller()
export class CircleController {
  constructor(private readonly circleService: CircleService) {}

  @MessagePattern({ cmd: 'create_circle' })
  create(@Payload() data: { name: string; type?: CircleType; region?: string; userId: string; payoutCycle?: string }) {
    return this.circleService.createCircle(data);
  }

  @MessagePattern({ cmd: 'join_circle' })
  join(@Payload() data: { inviteCode: string; userId: string }) {
    return this.circleService.joinCircle(data);
  }

  @MessagePattern({ cmd: 'get_my_circles' })
  myCircles(@Payload() data: { userId: string }) {
    return this.circleService.getMyCircles(data.userId);
  }

  @MessagePattern({ cmd: 'get_circle' })
  getOne(@Payload() data: { circleId: string }) {
    return this.circleService.getCircle(data.circleId);
  }

  @MessagePattern({ cmd: 'add_circle_basket_item' })
  addItem(@Payload() data: { circleId: string; productId: string; quantity?: number; userId: string }) {
    return this.circleService.addBasketItem(data);
  }

  @MessagePattern({ cmd: 'remove_circle_basket_item' })
  removeItem(@Payload() data: { itemId: string; userId?: string }) {
    return this.circleService.removeBasketItem(data);
  }

  @MessagePattern({ cmd: 'get_circle_basket' })
  basket(@Payload() data: { circleId: string }) {
    return this.circleService.getCircleBasket(data.circleId);
  }

  @MessagePattern({ cmd: 'get_circle_affinity' })
  affinity(@Payload() data: { circleId: string }) {
    return this.circleService.getCircleAffinity(data.circleId);
  }

  @MessagePattern({ cmd: 'get_product_demand' })
  productDemand() {
    return this.circleService.getProductDemand();
  }
}
