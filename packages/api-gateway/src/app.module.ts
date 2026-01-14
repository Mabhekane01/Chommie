import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { ProductController } from './product/product.controller';
import { BnplController } from './bnpl/bnpl.controller';
import { OrderController } from './order/order.controller';
import { PaymentController } from './payment/payment.controller';
import { ReviewController } from './product/review.controller';
import { WishlistController } from './product/wishlist.controller';
import { RecommendationController } from './recommendation/recommendation.controller';
import { NotificationController } from './notifications/notifications.controller';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
      {
        name: 'BNPL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3003,
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004,
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3005,
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3006,
        },
      },
      {
        name: 'RECOMMENDATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3007,
        },
      },
    ]),
  ],
  controllers: [
    AppController, 
    AuthController, 
    ProductController, 
    BnplController, 
    OrderController, 
    PaymentController, 
    ReviewController, 
    WishlistController, 
    RecommendationController,
    NotificationController
  ],
  providers: [AppService, EventsGateway],
})
export class AppModule {}