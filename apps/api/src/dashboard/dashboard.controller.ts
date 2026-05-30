import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('summary')
  getSummary(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.service.getSummary(userId, role, propertyId);
  }

  @Get('monthly-trend')
  getMonthlyTrend(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('months') months = 6,
  ) {
    return this.service.getMonthlyTrend(userId, role, Number(months));
  }

  @Get('pending-payments')
  getPendingPayments(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.service.getPendingPayments(userId, role);
  }
}
