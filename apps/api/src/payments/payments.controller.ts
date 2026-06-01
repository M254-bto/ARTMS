import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, CreatePaymentDto, RecordPaymentDto } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  /** Tenant records a payment (free-form, no rentChargeId needed) */
  @Roles(Role.TENANT)
  @Post('record')
  record(@Body() dto: RecordPaymentDto, @CurrentUser('id') userId: string) {
    return this.service.record(userId, dto);
  }

  /** Owner/admin creates a payment tied to a known charge */
  @Post()
  create(@Body() dto: CreatePaymentDto) { return this.service.create(dto); }

  /** Tenant views their own payments, paginated */
  @Roles(Role.TENANT)
  @Get('my')
  findMine(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.findMine(userId, page, limit);
  }

  /** Owner lists all payments, paginated */
  @Get()
  findAll(
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.service.findAll(propertyId, status, page, limit);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER, Role.PROPERTY_OWNER)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.confirm(id, userId);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER, Role.PROPERTY_OWNER)
  @Patch(':id/reject')
  reject(@Param('id') id: string) { return this.service.reject(id); }
}
