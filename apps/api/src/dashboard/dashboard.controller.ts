import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get('summary')
  getSummary(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.service.getSummary(userId, role, propertyId);
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get('monthly-trend')
  getMonthlyTrend(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('months') months = 6,
  ) {
    return this.service.getMonthlyTrend(userId, role, Math.min(Number(months), 12));
  }

  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get('pending-payments')
  getPendingPayments(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.service.getPendingPayments(userId, role);
  }
}
