import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.orderClient.send({ cmd: 'create_order' }, createOrderDto);
  }

  @Get('user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.orderClient.send({ cmd: 'get_user_orders' }, { userId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderClient.send({ cmd: 'get_order' }, { id });
  }
}
