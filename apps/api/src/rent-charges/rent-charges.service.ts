import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RentChargesService {
  constructor(private prisma: PrismaService) {}

  // Called manually or by cron on 1st of each month
  async generateMonthlyCharges() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const activeLeases = await this.prisma.lease.findMany({
      where: { isActive: true },
      include: { unit: true },
    });

    const results = [];
    for (const lease of activeLeases) {
      const existing = await this.prisma.rentCharge.findUnique({
        where: { leaseId_month_year: { leaseId: lease.id, month, year } },
      });
      if (existing) continue;

      const dueDate = new Date(year, month - 1, lease.rentDay || 1);
      const charge = await this.prisma.rentCharge.create({
        data: {
          leaseId: lease.id,
          amount: lease.unit.monthlyRent,
          dueDate,
          month,
          year,
          status: 'PENDING',
        },
      });
      results.push(charge);
    }
    return { generated: results.length, month, year };
  }

  @Cron('0 0 1 * *') // 1st of every month at midnight
  async scheduledGeneration() {
    await this.generateMonthlyCharges();
  }

  findByLease(leaseId: string) {
    return this.prisma.rentCharge.findMany({
      where: { leaseId },
      include: { payments: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  findByTenant(tenantId: string) {
    return this.prisma.rentCharge.findMany({
      where: { lease: { tenantId } },
      include: { payments: true, lease: { include: { unit: { include: { property: { select: { name: true } } } } } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async updateStatuses() {
    const now = new Date();
    // Mark overdue
    await this.prisma.rentCharge.updateMany({
      where: { status: 'PENDING', dueDate: { lt: now } },
      data: { status: 'OVERDUE' },
    });
  }
}
