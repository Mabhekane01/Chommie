import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { DiscoveryModule } from './discovery/discovery.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
        },
      },
    ]),
    RecommendationsModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
