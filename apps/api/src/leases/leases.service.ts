import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeasesService {
  constructor(private prisma: PrismaService) {}

  findByTenant(tenantId: string) {
    return this.prisma.lease.findMany({
      where: { tenantId },
      include: { unit: { include: { property: { select: { name: true } } } }, rentCharges: { include: { payments: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  terminate(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({ where: { id }, data: { isActive: false, endDate: new Date() } });
      await tx.unit.update({ where: { id: lease.unitId }, data: { status: 'VACANT' } });
      // Unlink tenant from unit
      await tx.tenant.updateMany({ where: { unitId: lease.unitId }, data: { unitId: null } });
      return lease;
    });
  }
}
