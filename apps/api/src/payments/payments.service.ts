import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  rentChargeId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const charge = await this.prisma.rentCharge.findUnique({ where: { id: dto.rentChargeId } });
    if (!charge) throw new NotFoundException('Rent charge not found');

    return this.prisma.payment.create({
      data: {
        rentChargeId: dto.rentChargeId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        referenceNumber: dto.referenceNumber,
        method: dto.method,
        notes: dto.notes,
        status: 'PENDING_CONFIRMATION',
      },
      include: { rentCharge: { include: { lease: { include: { tenant: { include: { user: { select: { firstName: true, lastName: true } } } }, unit: true } } } } },
    });
  }

  async confirm(id: string, confirmingUserId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { rentCharge: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.$transaction(async (tx) => {
      const confirmed = await tx.payment.update({
        where: { id },
        data: { status: 'CONFIRMED', confirmedAt: new Date(), confirmedBy: confirmingUserId },
      });

      // Recalculate charge status
      const allPayments = await tx.payment.findMany({
        where: { rentChargeId: payment.rentChargeId, status: 'CONFIRMED' },
      });
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const chargeAmount = Number(payment.rentCharge.amount);

      let chargeStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE';
      if (totalPaid >= chargeAmount) chargeStatus = 'PAID';
      else if (totalPaid > 0) chargeStatus = 'PARTIALLY_PAID';
      else chargeStatus = payment.rentCharge.status as any;

      await tx.rentCharge.update({ where: { id: payment.rentChargeId }, data: { status: chargeStatus } });

      // Auto-generate receipt on confirmation
      if (chargeStatus === 'PAID' || chargeStatus === 'PARTIALLY_PAID') {
        const receiptNum = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        await tx.receipt.upsert({
          where: { paymentId: id },
          create: { paymentId: id, receiptNumber: receiptNum },
          update: {},
        });
      }

      return confirmed;
    });
  }

  async reject(id: string) {
    return this.prisma.payment.update({ where: { id }, data: { status: 'REJECTED' } });
  }

  findAll(propertyId?: string, status?: string) {
    return this.prisma.payment.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(propertyId ? { rentCharge: { lease: { unit: { propertyId } } } } : {}),
      },
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
        receipt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
