import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Return } from './entities/return.entity';
import { Coupon } from './entities/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Return, Coupon]),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.NOTIFICATION_SERVICE_PORT) || 3005,
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
        },
      },
      {
        name: 'BNPL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.BNPL_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.BNPL_SERVICE_PORT) || 3003,
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PAYMENT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.PAYMENT_SERVICE_PORT) || 3006,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
