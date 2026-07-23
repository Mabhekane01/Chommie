import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SupplyService } from './supply.service';

@Controller()
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @MessagePattern({ cmd: 'create_supplier' })
  createSupplier(@Payload() data: any) {
    return this.supplyService.createSupplier(data);
  }

  @MessagePattern({ cmd: 'list_suppliers' })
  listSuppliers() {
    return this.supplyService.listSuppliers();
  }

  @MessagePattern({ cmd: 'create_offtake' })
  createAgreement(@Payload() data: any) {
    return this.supplyService.createAgreement(data);
  }

  @MessagePattern({ cmd: 'list_offtake' })
  listAgreements(@Payload() data: { supplierId?: string }) {
    return this.supplyService.listAgreements(data?.supplierId);
  }

  @MessagePattern({ cmd: 'get_demand_forecast' })
  demandForecast() {
    return this.supplyService.getDemandForecast();
  }
}
