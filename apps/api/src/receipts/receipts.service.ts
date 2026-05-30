import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId?: string) {
    return this.prisma.receipt.findMany({
      where: tenantId ? { payment: { rentCharge: { lease: { tenantId } } } } : {},
      include: {
        payment: {
          include: {
            rentCharge: {
              include: {
                lease: {
                  include: {
                    tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
                    unit: { include: { property: { select: { name: true } } } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            rentCharge: {
              include: {
                lease: {
                  include: {
                    tenant: { include: { user: true } },
                    unit: { include: { property: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
