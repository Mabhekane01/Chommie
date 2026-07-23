import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';
import { Supplier } from './entities/supplier.entity';
import { OffTakeAgreement } from './entities/offtake-agreement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier, OffTakeAgreement]),
    ClientsModule.register([
      {
        name: 'MEMBERSHIP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MEMBERSHIP_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.MEMBERSHIP_SERVICE_PORT) || 3009,
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
    ]),
  ],
  providers: [SupplyService],
  controllers: [SupplyController],
  exports: [SupplyService],
})
export class SupplyModule {}
