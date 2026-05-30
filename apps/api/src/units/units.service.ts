import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnitStatus } from '@prisma/client';

export class CreateUnitDto {
  unitNumber: string;
  unitType?: string;
  monthlyRent: number;
  depositAmount?: number;
  floor?: number;
  propertyId: string;
}

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: { ...dto, monthlyRent: dto.monthlyRent, depositAmount: dto.depositAmount ?? 0 },
      include: { property: { select: { name: true } } },
    });
  }

  findByProperty(propertyId: string) {
    return this.prisma.unit.findMany({
      where: { propertyId },
      include: { tenant: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } } },
      orderBy: { unitNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } }, leases: { where: { isActive: true } } } },
        maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  update(id: string, data: Partial<CreateUnitDto> & { status?: UnitStatus }) {
    return this.prisma.unit.update({ where: { id }, data });
  }

  updateStatus(id: string, status: UnitStatus) {
    return this.prisma.unit.update({ where: { id }, data: { status } });
  }

  remove(id: string) {
    return this.prisma.unit.delete({ where: { id } });
  }

  getVacancies(propertyId?: string) {
    return this.prisma.unit.findMany({
      where: { status: 'VACANT', ...(propertyId ? { propertyId } : {}) },
      include: { property: { select: { name: true, location: true } } },
    });
  }
}
