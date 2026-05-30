import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceCategory, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceDto {
  tenantId: string;
  unitId: string;
  category: MaintenanceCategory;
  description: string;
  photos?: string[];
}

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMaintenanceDto) {
    return this.prisma.maintenanceRequest.create({
      data: { ...dto, photos: dto.photos || [], status: 'SUBMITTED' },
      include: { tenant: { include: { user: { select: { firstName: true, lastName: true } } } }, unit: { include: { property: { select: { name: true } } } } },
    });
  }

  findAll(propertyId?: string, status?: MaintenanceStatus) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(propertyId ? { unit: { propertyId } } : {}),
      },
      include: {
        tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
        unit: { include: { property: { select: { name: true } } } },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { tenant: { include: { user: true } }, unit: { include: { property: true } }, updates: { orderBy: { createdAt: 'asc' } } },
    });
    if (!r) throw new NotFoundException('Maintenance request not found');
    return r;
  }

  async updateStatus(id: string, status: MaintenanceStatus, note: string, updatedBy?: string, assignedTo?: string) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status, ...(assignedTo ? { assignedTo } : {}) },
      });
      await tx.maintenanceUpdate.create({ data: { requestId: id, status, note, updatedBy } });
      return updated;
    });
  }
}
