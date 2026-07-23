import { Controller, Get, Post, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AdminGuard } from '../auth/admin.guard';

/**
 * REST surface for the supply side (do.md §5): suppliers, off-take agreements,
 * and the forecastable-demand report. Internal-only — admin gated.
 */
@UseGuards(AdminGuard)
@Controller()
export class SupplyController {
  constructor(@Inject('SUPPLY_SERVICE') private readonly supplyClient: ClientProxy) {}

  @Post('suppliers')
  createSupplier(@Body() data: any) {
    return this.supplyClient.send({ cmd: 'create_supplier' }, data);
  }

  @Get('suppliers')
  listSuppliers() {
    return this.supplyClient.send({ cmd: 'list_suppliers' }, {});
  }

  @Post('offtake')
  createAgreement(@Body() data: any) {
    return this.supplyClient.send({ cmd: 'create_offtake' }, data);
  }

  @Get('offtake')
  listAgreements(@Query('supplierId') supplierId?: string) {
    return this.supplyClient.send({ cmd: 'list_offtake' }, { supplierId });
  }

  @Get('demand-forecast')
  demandForecast() {
    return this.supplyClient.send({ cmd: 'get_demand_forecast' }, {});
  }
}
