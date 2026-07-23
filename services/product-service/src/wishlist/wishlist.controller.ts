import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WishlistService } from './wishlist.service';

@Controller()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @MessagePattern({ cmd: 'get_wishlist' })
  getWishlist(@Payload() userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @MessagePattern({ cmd: 'add_to_wishlist' })
  addProduct(@Payload() data: { userId: string; productId: string }) {
    return this.wishlistService.addProduct(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'remove_from_wishlist' })
  removeProduct(@Payload() data: { userId: string; productId: string }) {
    return this.wishlistService.removeProduct(data.userId, data.productId);
  }
}
