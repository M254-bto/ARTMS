import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceCategory, MaintenanceStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, ArrayMaxSize, MaxLength } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsEnum(MaintenanceCategory)
  category: MaintenanceCategory;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  photos?: string[];
}

// Safe user select (never return password hash)
const SAFE_USER_SELECT = {
  select: { id: true, firstName: true, lastName: true, email: true, phone: true },
} as const;

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  // ── Helper: build property ownership filter ───────────────────────────────

  private buildPropertyFilter(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') return {};
    if (role === 'PROPERTY_OWNER') return { ownerId: userId };
    if (role === 'PROPERTY_MANAGER') return { managerId: userId };
    return {};
  }

  create(dto: CreateMaintenanceDto) {
    return this.prisma.maintenanceRequest.create({
      data: { ...dto, photos: dto.photos || [], status: 'SUBMITTED' },
      include: {
        tenant: { include: { user: SAFE_USER_SELECT } },
        unit: { include: { property: { select: { name: true } } } },
      },
    });
  }

  findAll(userId: string, role: string, propertyId?: string, status?: MaintenanceStatus) {
    const propertyFilter = this.buildPropertyFilter(userId, role);

    return this.prisma.maintenanceRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        unit: {
          property: {
            ...propertyFilter,
            ...(propertyId ? { id: propertyId } : {}),
          },
        },
      },
      include: {
        tenant: { include: { user: SAFE_USER_SELECT } },
        unit: { include: { property: { select: { name: true } } } },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const r = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        tenant: { include: { user: SAFE_USER_SELECT } },
        unit: { include: { property: { select: { id: true, name: true, ownerId: true, managerId: true } } } },
        updates: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!r) throw new NotFoundException('Maintenance request not found');

    // Tenants can only view their own requests
    if (role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({ where: { userId } });
      if (!tenant || r.tenantId !== tenant.id) {
        throw new ForbiddenException('You do not have access to this request');
      }
    } else if (role !== 'SUPER_ADMIN') {
      // Owner/manager — verify property ownership
      const prop = r.unit.property;
      if (prop.ownerId !== userId && prop.managerId !== userId) {
        throw new ForbiddenException('You do not have access to this request');
      }
    }

    return r;
  }

  async updateStatus(id: string, status: MaintenanceStatus, note: string, userId: string, role: string, assignedTo?: string) {
    // Verify access
    if (role !== 'SUPER_ADMIN') {
      const req = await this.prisma.maintenanceRequest.findUnique({
        where: { id },
        select: { unit: { select: { property: { select: { ownerId: true, managerId: true } } } } },
      });
      if (!req) throw new NotFoundException('Maintenance request not found');
      const prop = req.unit.property;
      if (prop.ownerId !== userId && prop.managerId !== userId) {
        throw new ForbiddenException('You do not have access to this request');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status, ...(assignedTo ? { assignedTo } : {}) },
      });
      await tx.maintenanceUpdate.create({ data: { requestId: id, status, note, updatedBy: userId } });
      return updated;
    });
  }
}
