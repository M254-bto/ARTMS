import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService, CreateMaintenanceDto } from './maintenance.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MaintenanceStatus } from '@prisma/client';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private service: MaintenanceService) {}

  @Post()
  create(@Body() dto: CreateMaintenanceDto) { return this.service.create(dto); }

  @Get()
  findAll(@Query('propertyId') propertyId?: string, @Query('status') status?: MaintenanceStatus) {
    return this.service.findAll(propertyId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MaintenanceStatus,
    @Body('note') note: string,
    @Body('assignedTo') assignedTo: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateStatus(id, status, note, userId, assignedTo);
  }
}
