import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, role: string, propertyId?: string) {
    const propertyFilter = this.buildPropertyFilter(userId, role, propertyId);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Calculate last month and last month's year
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth === 0) {
      lastMonth = 12;
      lastMonthYear = currentYear - 1;
    }

    const firstDayOfThisMonth = new Date(currentYear, now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(lastMonthYear, lastMonth - 1, 1);
    const lastDayOfLastMonth = new Date(currentYear, now.getMonth(), 0);

    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalTenants,
      openMaintenance,
      currentMonthPayments,
      currentMonthCharges,
      // Metrics for last month for comparison
      lastMonthPayments,
      occupiedUnitsLastMonth,
      tenantsLastMonth,
      maintenanceThisMonth,
      maintenanceLastMonth,
    ] = await Promise.all([
      this.prisma.property.count({ where: { ...propertyFilter, isArchived: false } }),
      this.prisma.unit.count({ where: { property: propertyFilter } }),
      this.prisma.unit.count({ where: { status: 'OCCUPIED', property: propertyFilter } }),
      this.prisma.tenant.count({ where: { unit: { property: propertyFilter } } }),
      this.prisma.maintenanceRequest.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] }, unit: { property: propertyFilter } } }),
      this.getMonthPayments(propertyFilter),
      this.getMonthCharges(propertyFilter),
      
      // Last month collected revenue
      this.prisma.payment.findMany({
        where: {
          status: 'CONFIRMED',
          rentCharge: { month: lastMonth, year: lastMonthYear, lease: { unit: { property: propertyFilter } } },
        },
        select: { amount: true },
      }),
      // Occupied last month
      this.prisma.unit.count({
        where: {
          property: propertyFilter,
          leases: {
            some: {
              startDate: { lte: lastDayOfLastMonth },
              OR: [
                { endDate: null },
                { endDate: { gte: firstDayOfLastMonth } }
              ]
            }
          }
        }
      }),
      // Tenants last month
      this.prisma.tenant.count({
        where: {
          unit: { property: propertyFilter },
          leases: {
            some: {
              startDate: { lte: lastDayOfLastMonth },
              OR: [
                { endDate: null },
                { endDate: { gte: firstDayOfLastMonth } }
              ]
            }
          }
        }
      }),
      // New maintenance requests created this month
      this.prisma.maintenanceRequest.count({
        where: {
          createdAt: { gte: firstDayOfThisMonth },
          unit: { property: propertyFilter }
        }
      }),
      // New maintenance requests created last month
      this.prisma.maintenanceRequest.count({
        where: {
          createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfThisMonth },
          unit: { property: propertyFilter }
        }
      }),
    ]);

    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const occupancyRateLastMonth = totalUnits > 0 ? Math.round((occupiedUnitsLastMonth / totalUnits) * 100) : 0;

    const collectedThisMonth = currentMonthPayments.filter((p) => p.status === 'CONFIRMED').reduce((sum, p) => sum + Number(p.amount), 0);
    const expectedThisMonth = currentMonthCharges.reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingConfirmation = currentMonthPayments.filter((p) => p.status === 'PENDING_CONFIRMATION').length;

    const collectedLastMonth = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate actual MoM trends (rounded to 1 decimal place)
    const collectionsTrend = collectedLastMonth > 0
      ? Math.round(((collectedThisMonth - collectedLastMonth) / collectedLastMonth) * 1000) / 10
      : collectedThisMonth > 0 ? 100 : 0;

    const occupancyTrend = occupancyRateLastMonth > 0
      ? Math.round(((occupancyRate - occupancyRateLastMonth) / occupancyRateLastMonth) * 1000) / 10
      : occupancyRate > 0 ? 100 : 0;

    const tenantsTrend = tenantsLastMonth > 0
      ? Math.round(((totalTenants - tenantsLastMonth) / tenantsLastMonth) * 1000) / 10
      : totalTenants > 0 ? 100 : 0;

    // A decrease in maintenance requests is a positive trend
    const maintenanceTrend = maintenanceLastMonth > 0
      ? Math.round(((maintenanceThisMonth - maintenanceLastMonth) / maintenanceLastMonth) * 1000) / 10
      : maintenanceThisMonth > 0 ? 100 : 0;

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
      // Trend percentages
      collectionsTrend,
      occupancyTrend,
      tenantsTrend,
      maintenanceTrend,
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
