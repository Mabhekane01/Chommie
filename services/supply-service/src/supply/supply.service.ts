import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { Supplier } from './entities/supplier.entity';
import { OffTakeAgreement } from './entities/offtake-agreement.entity';

interface DemandRow {
  productId: string;
  standingQty: number;
  circleQty: number;
  members: number;
}

@Injectable()
export class SupplyService {
  private readonly logger = new Logger(SupplyService.name);

  constructor(
    @InjectRepository(Supplier) private readonly suppliers: Repository<Supplier>,
    @InjectRepository(OffTakeAgreement) private readonly agreements: Repository<OffTakeAgreement>,
    @Inject('MEMBERSHIP_SERVICE') private readonly membershipClient: ClientProxy,
    @Inject('CIRCLE_SERVICE') private readonly circleClient: ClientProxy,
  ) {}

  createSupplier(data: Partial<Supplier>) {
    return this.suppliers.save(this.suppliers.create(data));
  }

  listSuppliers() {
    return this.suppliers.find({ order: { createdAt: 'DESC' } });
  }

  createAgreement(data: Partial<OffTakeAgreement>) {
    return this.agreements.save(this.agreements.create(data));
  }

  listAgreements(supplierId?: string) {
    return supplierId
      ? this.agreements.find({ where: { supplierId }, order: { createdAt: 'DESC' } })
      : this.agreements.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Forecastable demand (do.md §5.4): aggregate standing-basket + pooled circle
   * demand per product, and compare it against active off-take coverage. This is
   * the artefact taken to producers to negotiate near-wholesale terms.
   */
  async getDemandForecast() {
    const [standing, circle] = await Promise.all([
      lastValueFrom(
        this.membershipClient.send({ cmd: 'get_product_demand' }, {}).pipe(timeout(3000)),
      ).catch(() => [] as any[]),
      lastValueFrom(
        this.circleClient.send({ cmd: 'get_product_demand' }, {}).pipe(timeout(3000)),
      ).catch(() => [] as any[]),
    ]);

    const map = new Map<string, DemandRow>();
    for (const s of standing as any[]) {
      const e = map.get(s.productId) ?? { productId: s.productId, standingQty: 0, circleQty: 0, members: 0 };
      e.standingQty += Number(s.quantity) || 0;
      e.members += Number(s.members) || 0;
      map.set(s.productId, e);
    }
    for (const c of circle as any[]) {
      const e = map.get(c.productId) ?? { productId: c.productId, standingQty: 0, circleQty: 0, members: 0 };
      e.circleQty += Number(c.quantity) || 0;
      map.set(c.productId, e);
    }

    const active = await this.agreements.find({ where: { status: 'ACTIVE' } });
    const coveredByProduct = new Map<string, number>();
    for (const a of active) {
      if (a.productId) {
        coveredByProduct.set(a.productId, (coveredByProduct.get(a.productId) ?? 0) + a.minVolumeUnits);
      }
    }

    return [...map.values()]
      .map((e) => {
        const totalDemand = e.standingQty + e.circleQty;
        const covered = coveredByProduct.get(e.productId) ?? 0;
        return {
          ...e,
          totalDemand,
          coveredVolume: covered,
          uncoveredVolume: Math.max(0, totalDemand - covered),
        };
      })
      .sort((a, b) => b.totalDemand - a.totalDemand);
  }
}
