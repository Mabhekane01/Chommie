import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DiscoveryService } from './discovery.service';
import { DiscoveryController } from './discovery.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
        },
      },
      {
        name: 'CIRCLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CIRCLE_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.CIRCLE_SERVICE_PORT) || 3008,
        },
      },
      {
        name: 'MEMBERSHIP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MEMBERSHIP_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.MEMBERSHIP_SERVICE_PORT) || 3009,
        },
      },
      {
        name: 'AD_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AD_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.AD_SERVICE_PORT) || 3010,
        },
      },
    ]),
  ],
  providers: [DiscoveryService],
  controllers: [DiscoveryController],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
