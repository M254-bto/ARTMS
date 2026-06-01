import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  // ── Helper: verify caller owns/manages the property ──────────────────────

  private async verifyOwnership(propertyId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN') return;

    const prop = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, managerId: true },
    });
    if (!prop) throw new NotFoundException('Property not found');
    if (prop.ownerId !== userId && prop.managerId !== userId) {
      throw new ForbiddenException('You do not have access to this property');
    }
  }

  create(ownerId: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: { ...dto, ownerId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { units: true } },
      },
    });
  }

  findAll(userId: string, role: string) {
    const where = role === 'SUPER_ADMIN' ? {} : role === 'PROPERTY_OWNER' ? { ownerId: userId } : { managerId: userId };
    return this.prisma.property.findMany({
      where: { ...where, isArchived: false },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { units: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    await this.verifyOwnership(id, userId, role);

    const p = await this.prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        units: { orderBy: { unitNumber: 'asc' } },
      },
    });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  async update(id: string, data: Partial<CreatePropertyDto>, userId: string, role: string) {
    await this.verifyOwnership(id, userId, role);
    return this.prisma.property.update({
      where: { id },
      data,
      include: { _count: { select: { units: true } } },
    });
  }

  async archive(id: string, userId: string, role: string) {
    await this.verifyOwnership(id, userId, role);
    return this.prisma.property.update({ where: { id }, data: { isArchived: true } });
  }
}
