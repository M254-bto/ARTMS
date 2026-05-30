import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeasesService } from './leases.service';

@ApiTags('Leases')
@ApiBearerAuth()
@Controller('leases')
export class LeasesController {
  constructor(private service: LeasesService) {}

  @Get('tenant/:tenantId')
  findByTenant(@Param('tenantId') id: string) { return this.service.findByTenant(id); }

  @Patch(':id/terminate')
  terminate(@Param('id') id: string) { return this.service.terminate(id); }
}
