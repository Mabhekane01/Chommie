import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { CirclesController } from './circles/circles.controller';
import { MembershipController } from './membership/membership.controller';
import { AdsController } from './ads/ads.controller';
import { SupplyController } from './supply/supply.controller';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    // Rate limit the public API: 120 requests / minute / IP (override via env).
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS) || 60000,
        limit: Number(process.env.THROTTLE_LIMIT) || 120,
      },
    ]),
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
      {
        name: 'CIRCLE_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.CIRCLE_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.CIRCLE_SERVICE_PORT) || 3008,
          },
        }),
      },
      {
        name: 'MEMBERSHIP_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.MEMBERSHIP_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.MEMBERSHIP_SERVICE_PORT) || 3009,
          },
        }),
      },
      {
        name: 'AD_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.AD_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.AD_SERVICE_PORT) || 3010,
          },
        }),
      },
      {
        name: 'SUPPLY_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: process.env.SUPPLY_SERVICE_HOST || '127.0.0.1',
            port: Number(process.env.SUPPLY_SERVICE_PORT) || 3011,
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
    CirclesController,
    MembershipController,
    AdsController,
    SupplyController
  ],
  providers: [AppService, EventsGateway, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
