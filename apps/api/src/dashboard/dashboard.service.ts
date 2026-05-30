import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, role: string, propertyId?: string) {
    const propertyFilter = this.buildPropertyFilter(userId, role, propertyId);

    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalTenants,
      openMaintenance,
      currentMonthPayments,
      currentMonthCharges,
    ] = await Promise.all([
      this.prisma.property.count({ where: { ...propertyFilter, isArchived: false } }),
      this.prisma.unit.count({ where: { property: propertyFilter } }),
      this.prisma.unit.count({ where: { status: 'OCCUPIED', property: propertyFilter } }),
      this.prisma.tenant.count({ where: { unit: { property: propertyFilter } } }),
      this.prisma.maintenanceRequest.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] }, unit: { property: propertyFilter } } }),
      this.getMonthPayments(propertyFilter),
      this.getMonthCharges(propertyFilter),
    ]);

    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const collectedThisMonth = currentMonthPayments.filter((p) => p.status === 'CONFIRMED').reduce((sum, p) => sum + Number(p.amount), 0);
    const expectedThisMonth = currentMonthCharges.reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingConfirmation = currentMonthPayments.filter((p) => p.status === 'PENDING_CONFIRMATION').length;

    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate,
      totalTenants,
      openMaintenance,
      collectedThisMonth,
      expectedThisMonth,
      outstandingThisMonth: expectedThisMonth - collectedThisMonth,
      collectionRate: expectedThisMonth > 0 ? Math.round((collectedThisMonth / expectedThisMonth) * 100) : 0,
      pendingConfirmation,
    };
  }

  async getMonthlyTrend(userId: string, role: string, months = 6) {
    const propertyFilter = this.buildPropertyFilter(userId, role);
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const [charges, payments] = await Promise.all([
        this.prisma.rentCharge.aggregate({
          _sum: { amount: true },
          where: { month, year, lease: { unit: { property: propertyFilter } } },
        }),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'CONFIRMED', rentCharge: { month, year, lease: { unit: { property: propertyFilter } } } },
        }),
      ]);

      result.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year,
        expected: Number(charges._sum.amount ?? 0),
        collected: Number(payments._sum.amount ?? 0),
      });
    }

    return result;
  }

  async getPendingPayments(userId: string, role: string) {
    const propertyFilter = this.buildPropertyFilter(userId, role);
    return this.prisma.payment.findMany({
      where: { status: 'PENDING_CONFIRMATION', rentCharge: { lease: { unit: { property: propertyFilter } } } },
      include: {
        rentCharge: {
          include: {
            lease: {
              include: {
                tenant: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
                unit: { include: { property: { select: { name: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private buildPropertyFilter(userId: string, role: string, propertyId?: string) {
    if (propertyId) return { id: propertyId };
    if (role === 'SUPER_ADMIN') return {};
    if (role === 'PROPERTY_OWNER') return { ownerId: userId };
    if (role === 'PROPERTY_MANAGER') return { managerId: userId };
    return {};
  }

  private getMonthPayments(propertyFilter: any) {
    const now = new Date();
    return this.prisma.payment.findMany({
      where: {
        rentCharge: { month: now.getMonth() + 1, year: now.getFullYear(), lease: { unit: { property: propertyFilter } } },
      },
      select: { amount: true, status: true },
    });
  }

  private getMonthCharges(propertyFilter: any) {
    const now = new Date();
    return this.prisma.rentCharge.findMany({
      where: { month: now.getMonth() + 1, year: now.getFullYear(), lease: { unit: { property: propertyFilter } } },
      select: { amount: true, status: true },
    });
  }
}
