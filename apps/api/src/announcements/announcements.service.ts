import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsBoolean()
  sendViaEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  sendViaWhatsapp?: boolean;
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        propertyId: dto.propertyId,
        authorId,
        title: dto.title,
        body: dto.body,
        sentViaEmail: dto.sendViaEmail ?? false,
        sentViaWhatsapp: dto.sendViaWhatsapp ?? false,
      },
      include: { author: { select: { firstName: true, lastName: true } }, property: { select: { name: true } } },
    });
    // TODO Phase 5: trigger email/whatsapp via NotificationsService
    return announcement;
  }

  findByProperty(propertyId: string) {
    return this.prisma.announcement.findMany({
      where: { propertyId },
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
