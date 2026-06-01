import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
import {
  IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum,
  IsIn, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── DTOs ─────────────────────────────────────────────────────────────────────

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

/** Tenant-facing: record a payment without needing a rentChargeId */
export class RecordPaymentDto {
  /** Amount paid in KES */
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  /** RENT or OTHER */
  @IsIn(['RENT', 'OTHER'])
  paymentFor: 'RENT' | 'OTHER';

  /** 1–12 (required when paymentFor === RENT) */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  /** Full year e.g. 2025 (required when paymentFor === RENT) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

const PAYMENT_INCLUDE = {
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
} as const;

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // ── Tenant: record a new payment ──────────────────────────────────────────

  async record(tenantUserId: string, dto: RecordPaymentDto) {
    // Look up the tenant record for this user
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId: tenantUserId },
      include: { leases: { where: { isActive: true }, take: 1 } },
    });
    if (!tenant) throw new NotFoundException('Tenant profile not found');

    const lease = tenant.leases[0];
    if (!lease) throw new BadRequestException('No active lease found for your account');

    let rentChargeId: string;

    if (dto.paymentFor === 'RENT') {
      if (!dto.month || !dto.year) {
        throw new BadRequestException('Month and year are required for Rent payments');
      }
      // Find or create a RentCharge for that month/year
      const dueDate = new Date(dto.year, dto.month - 1, lease.rentDay ?? 1);
      const charge = await this.prisma.rentCharge.upsert({
        where: { leaseId_month_year: { leaseId: lease.id, month: dto.month, year: dto.year } },
        create: {
          leaseId: lease.id,
          amount: dto.amount,
          dueDate,
          month: dto.month,
          year: dto.year,
          status: 'PENDING',
        },
        update: {}, // leave existing charge unchanged
      });
      rentChargeId = charge.id;
    } else {
      // OTHER: create an ad-hoc charge (month=0 not real; use current date)
      // We don't use upsert here — each OTHER payment gets its own charge row
      // Use timestamp-encoded fake month to avoid unique constraint collision
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      // Attempt to always create a distinct row; since OTHER charges may repeat
      // in the same month/year we append a micro-offset year trick isn't perfect —
      // instead store month/year and fall back to creating if conflict
      try {
        const charge = await this.prisma.rentCharge.create({
          data: {
            leaseId: lease.id,
            amount: dto.amount,
            dueDate: now,
            month,
            year: year + 10000 + Date.now() % 10000, // unique surrogate year for OTHER
            status: 'PENDING',
            notes: dto.notes ?? 'Other payment',
          },
        });
        rentChargeId = charge.id;
      } catch {
        // Fallback create with a different surrogate
        const charge = await this.prisma.rentCharge.create({
          data: {
            leaseId: lease.id,
            amount: dto.amount,
            dueDate: now,
            month: 13,
            year: Date.now(),
            status: 'PENDING',
            notes: dto.notes ?? 'Other payment',
          },
        });
        rentChargeId = charge.id;
      }
    } // end else (OTHER)

    return this.prisma.payment.create({
      data: {
        rentChargeId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        referenceNumber: dto.referenceNumber,
        method: dto.method,
        notes: dto.notes,
        status: 'PENDING_CONFIRMATION',
      },
      include: PAYMENT_INCLUDE,
    });
  }

  // ── Owner: classic create (tied to a known rent charge) ──────────────────

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
      include: PAYMENT_INCLUDE,
    });
  }

  // ── Tenant: get own payments paginated ──────────────────────────────────

  async findMine(tenantUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const tenant = await this.prisma.tenant.findUnique({ where: { userId: tenantUserId } });
    if (!tenant) throw new NotFoundException('Tenant profile not found');

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { rentCharge: { lease: { tenantId: tenant.id } } },
        include: {
          rentCharge: { select: { month: true, year: true, notes: true, dueDate: true } },
          receipt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: { rentCharge: { lease: { tenantId: tenant.id } } },
      }),
    ]);

    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ── Owner: list all payments with pagination ─────────────────────────────

  async findAll(propertyId?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status ? { status: status as any } : {}),
      ...(propertyId ? { rentCharge: { lease: { unit: { propertyId } } } } : {}),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: PAYMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ── Confirm ─────────────────────────────────────────────────────────────

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
}
