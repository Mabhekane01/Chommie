import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { MembershipService } from './membership.service';
import type { MemberType, MembershipStatus } from './entities/membership.entity';
import type { BasketStatus } from './entities/standing-basket.entity';

@Controller()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @MessagePattern({ cmd: 'join_membership' })
  join(@Payload() data: { userId: string; type?: MemberType; region?: string }) {
    return this.membershipService.join(data);
  }

  @MessagePattern({ cmd: 'get_membership' })
  get(@Payload() data: { userId: string }) {
    return this.membershipService.get(data.userId);
  }

  @MessagePattern({ cmd: 'set_membership_status' })
  setStatus(@Payload() data: { userId: string; status: MembershipStatus }) {
    return this.membershipService.setStatus(data);
  }

  @MessagePattern({ cmd: 'get_standing_basket' })
  getBasket(@Payload() data: { userId: string }) {
    return this.membershipService.getBasket(data.userId);
  }

  @MessagePattern({ cmd: 'set_standing_basket_item' })
  setItem(@Payload() data: { userId: string; productId: string; quantity?: number }) {
    return this.membershipService.setItem(data);
  }

  @MessagePattern({ cmd: 'remove_standing_basket_item' })
  removeItem(@Payload() data: { userId: string; itemId: string }) {
    return this.membershipService.removeItem(data);
  }

  @MessagePattern({ cmd: 'set_basket_status' })
  setBasketStatus(@Payload() data: { userId: string; status: BasketStatus }) {
    return this.membershipService.setBasketStatus(data);
  }

  @MessagePattern({ cmd: 'get_standing_basket_skus' })
  getBasketSkus(@Payload() data: { userId: string }) {
    return this.membershipService.getBasketSkus(data.userId);
  }

  // Emitted by order-service when an order records savings vs retail (do.md §6).
  @EventPattern('accrue_savings')
  accrueSavings(@Payload() data: { userId: string; cents: number }) {
    return this.membershipService.accrueSavings(data.userId, data.cents);
  }

  // Aggregate standing-basket demand for supplier negotiation (do.md §5.4).
  @MessagePattern({ cmd: 'get_product_demand' })
  productDemand() {
    return this.membershipService.getProductDemand();
  }
}
