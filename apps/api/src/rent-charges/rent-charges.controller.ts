import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RentChargesService } from './rent-charges.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Rent Charges')
@ApiBearerAuth()
@Controller('rent-charges')
export class RentChargesController {
  constructor(private service: RentChargesService) {}

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER)
  @Post('generate')
  generate() { return this.service.generateMonthlyCharges(); }

  @Get('lease/:leaseId')
  findByLease(@Param('leaseId') id: string) { return this.service.findByLease(id); }

  @Get('tenant/:tenantId')
  findByTenant(@Param('tenantId') id: string) { return this.service.findByTenant(id); }
}
