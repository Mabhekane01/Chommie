import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DiscoveryService } from './discovery.service';
import type { DiscoveryContext } from './discovery.types';

@Controller()
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @MessagePattern({ cmd: 'get_discovery_feed' })
  getFeed(@Payload() ctx: DiscoveryContext) {
    return this.discovery.getFeed(ctx ?? {});
  }
}
