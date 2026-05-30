import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, CreatePaymentDto } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  // Tenant submits a payment
  @Post()
  create(@Body() dto: CreatePaymentDto) { return this.service.create(dto); }

  @Get()
  findAll(@Query('propertyId') propertyId?: string, @Query('status') status?: string) {
    return this.service.findAll(propertyId, status);
  }

  // Manager confirms payment
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER, Role.PROPERTY_OWNER)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.confirm(id, userId);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER)
  @Patch(':id/reject')
  reject(@Param('id') id: string) { return this.service.reject(id); }
}
