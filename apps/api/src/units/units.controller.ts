import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService, CreateUnitDto } from './units.service';
import { UnitStatus } from '@prisma/client';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private service: UnitsService) {}

  @Post()
  create(@Body() dto: CreateUnitDto) { return this.service.create(dto); }

  @Post('bulk')
  createBulk(
    @Body('propertyId') propertyId: string,
    @Body('units') units: Omit<CreateUnitDto, 'propertyId'>[],
  ) {
    return this.service.createBulk(propertyId, units);
  }

  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') id: string) { return this.service.findByProperty(id); }

  @Get('vacancies')
  getVacancies(@Query('propertyId') propertyId?: string) { return this.service.getVacancies(propertyId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: UnitStatus) { return this.service.updateStatus(id, status); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
