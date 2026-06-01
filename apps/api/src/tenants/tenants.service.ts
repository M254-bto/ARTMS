import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// DTO used by POST /tenants/invite (owner fills this — no password)
export class InviteTenantDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  leaseStartDate: string;

  @IsOptional()
  @IsString()
  leaseEndDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  @Type(() => Number)
  rentDay?: number;
}

// DTO used by POST /tenants/accept-invite (tenant sets own password)
export class AcceptInviteDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;
}

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {}

  // ── OWNER: send invite ─────────────────────────────────────────────────────

  async invite(dto: InviteTenantDto) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { property: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status === 'OCCUPIED') throw new ConflictException('Unit is already occupied');

    // No duplicate pending invite for same unit
    const existing = await this.prisma.tenantInvite.findFirst({
      where: { unitId: dto.unitId, used: false, expiresAt: { gt: new Date() } },
    });
    if (existing) throw new ConflictException('A pending invite already exists for this unit');

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('This email is already registered');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.tenantInvite.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        unitId: dto.unitId,
        leaseStartDate: new Date(dto.leaseStartDate),
        leaseEndDate: dto.leaseEndDate ? new Date(dto.leaseEndDate) : undefined,
        rentDay: dto.rentDay ?? 1,
        expiresAt,
      },
    });

    const appUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${appUrl}/register?token=${invite.token}`;

    await this.notifications.sendEmail(
      dto.email,
      `You've been added to ${unit.property.name} — Set up your ARTMS account`,
      `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#fff;background:#09090b;padding:24px;border-radius:8px 8px 0 0;margin:0">
            Welcome to ARTMS
          </h2>
          <div style="background:#18181b;padding:24px;border-radius:0 0 8px 8px;color:#a1a1aa">
            <p>Hi <strong style="color:#fff">${dto.firstName}</strong>,</p>
            <p>You've been added as a tenant at <strong style="color:#fff">${unit.property.name}</strong>,
               Unit <strong style="color:#fff">${unit.unitNumber}</strong>.</p>
            <p>Click below to set up your account and access your tenant dashboard:</p>
            <a href="${link}"
               style="display:inline-block;margin:16px 0;padding:12px 28px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
              Set Up My Account
            </a>
            <p style="font-size:12px;color:#52525b">This link expires in 7 days. If you didn't expect this, you can ignore it.</p>
          </div>
        </div>
      `,
    );

    if (dto.phone) {
      await this.notifications.sendWhatsApp(
        dto.phone,
        `Hi ${dto.firstName}! You've been added as a tenant at ${unit.property.name}, Unit ${unit.unitNumber}. Set up your ARTMS account here: ${link} (expires in 7 days)`,
      );
    }

    return { message: 'Invite sent successfully', inviteId: invite.id, token: invite.token, link };
  }

  // ── TENANT: accept invite & create account ─────────────────────────────────

  async acceptInvite(dto: AcceptInviteDto) {
    const invite = await this.prisma.tenantInvite.findUnique({
      where: { token: dto.token },
      include: { unit: { include: { property: true } } },
    });
    if (!invite) throw new NotFoundException('Invalid invite link');
    if (invite.used) throw new BadRequestException('This invite has already been used');
    if (invite.expiresAt < new Date()) throw new BadRequestException('This invite link has expired');

    const existing = await this.prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) throw new ConflictException('An account already exists for this email');

    const hashed = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invite.email,
          password: hashed,
          firstName: invite.firstName,
          lastName: invite.lastName,
          phone: invite.phone ?? undefined,
          role: 'TENANT',
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          userId: user.id,
          unitId: invite.unitId,
          nationalId: dto.nationalId,
          emergencyContact: dto.emergencyContact,
          emergencyPhone: dto.emergencyPhone,
          moveInDate: invite.leaseStartDate,
        },
      });

      await tx.lease.create({
        data: {
          tenantId: tenant.id,
          unitId: invite.unitId,
          startDate: invite.leaseStartDate,
          endDate: invite.leaseEndDate ?? undefined,
          rentDay: invite.rentDay,
          isActive: true,
        },
      });

      await tx.unit.update({ where: { id: invite.unitId }, data: { status: 'OCCUPIED' } });
      await tx.tenantInvite.update({ where: { id: invite.id }, data: { used: true } });

      return {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        propertyName: invite.unit.property.name,
        unitNumber: invite.unit.unitNumber,
      };
    });
  }

  // ── Invite preview (for register page to pre-fill) ─────────────────────────

  async getInvitePreview(token: string) {
    const invite = await this.prisma.tenantInvite.findUnique({
      where: { token },
      include: { unit: { include: { property: { select: { name: true } } } } },
    });
    if (!invite) throw new NotFoundException('Invalid invite link');
    if (invite.used) throw new BadRequestException('This invite has already been used');
    if (invite.expiresAt < new Date()) throw new BadRequestException('This invite link has expired');

    return {
      firstName: invite.firstName,
      lastName: invite.lastName,
      email: invite.email,
      phone: invite.phone,
      unitNumber: invite.unit.unitNumber,
      propertyName: invite.unit.property.name,
    };
  }

  // ── READ helpers ────────────────────────────────────────────────────────────

  findAll(propertyId?: string) {
    return this.prisma.tenant.findMany({
      where: propertyId ? { unit: { propertyId } } : {},
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        unit: { include: { property: { select: { id: true, name: true } } } },
        leases: { where: { isActive: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true } },
        unit: { include: { property: true } },
        leases: { include: { rentCharges: { include: { payments: true }, orderBy: { year: 'desc' } } } },
        maintenanceRequests: { orderBy: { createdAt: 'desc' }, include: { updates: true } },
      },
    });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async findByUserId(userId: string) {
    return this.prisma.tenant.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        unit: { include: { property: true } },
        leases: { where: { isActive: true }, include: { rentCharges: { include: { payments: true } } } },
        maintenanceRequests: { orderBy: { createdAt: 'desc' }, include: { updates: true } },
      },
    });
  }

  findInvites(propertyId?: string) {
    return this.prisma.tenantInvite.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
        ...(propertyId ? { unit: { propertyId } } : {}),
      },
      include: {
        unit: { include: { property: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
