import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(userId: string, action: string, entity: string, entityId: string, meta?: any) {
    return this.prisma.auditLog.create({
      data: { userId, action, entity, entityId, meta },
    });
  }

  findAll(userId?: string, entity?: string) {
    return this.prisma.auditLog.findMany({
      where: { ...(userId ? { userId } : {}), ...(entity ? { entity } : {}) },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
