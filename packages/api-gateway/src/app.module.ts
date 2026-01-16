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
import { VendorsController } from './vendors/vendors.controller';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: () => {
          console.log('AUTH_SERVICE config:', {
            host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
          });
          return {
            transport: Transport.TCP,
            options: {
              host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
              port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
            },
          };
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.PRODUCT_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
          },
        }),
      },
      {
        name: 'BNPL_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.BNPL_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.BNPL_SERVICE_PORT) || 3003,
          },
        }),
      },
      {
        name: 'ORDER_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.ORDER_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.ORDER_SERVICE_PORT) || 3004,
          },
        }),
      },
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.NOTIFICATION_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.NOTIFICATION_SERVICE_PORT) || 3005,
          },
        }),
      },
      {
        name: 'PAYMENT_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.PAYMENT_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.PAYMENT_SERVICE_PORT) || 3006,
          },
        }),
      },
      {
        name: 'RECOMMENDATION_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.RECOMMENDATION_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.RECOMMENDATION_SERVICE_PORT) || 3007,
          },
        }),
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
    NotificationController,
    VendorsController
  ],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
