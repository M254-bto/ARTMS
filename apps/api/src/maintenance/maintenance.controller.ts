import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService, CreateMaintenanceDto } from './maintenance.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, MaintenanceStatus } from '@prisma/client';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private service: MaintenanceService) {}

  @Post()
  create(@Body() dto: CreateMaintenanceDto) { return this.service.create(dto); }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.service.findAll(userId, role, propertyId, status);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.service.findOne(id, userId, role);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MaintenanceStatus,
    @Body('note') note: string,
    @Body('assignedTo') assignedTo: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.service.updateStatus(id, status, note, userId, role, assignedTo);
  }
}
