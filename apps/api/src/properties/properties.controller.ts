import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService, CreatePropertyDto } from './properties.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  constructor(private service: PropertiesService) {}

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER)
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePropertyDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.service.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePropertyDto>) {
    return this.service.update(id, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER)
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.service.archive(id);
  }
}
