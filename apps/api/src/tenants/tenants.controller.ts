import { Controller, Get, Post, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService, InviteTenantDto, AcceptInviteDto } from './tenants.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  // Owner: send invite email + WhatsApp to tenant
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_MANAGER, Role.PROPERTY_OWNER)
  @Post('invite')
  invite(@Body() dto: InviteTenantDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.service.invite(dto, userId, role);
  }

  // Tenant: accept invite token and set password (public — no JWT needed)
  @Public()
  @Post('accept-invite')
  acceptInvite(@Body() dto: AcceptInviteDto) { return this.service.acceptInvite(dto); }

  // Register page: read invite details to pre-fill the form (public)
  @Public()
  @Get('invite-preview/:token')
  getInvitePreview(@Param('token') token: string) { return this.service.getInvitePreview(token); }

  // Owner: list tenants scoped to their own properties, paginated
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('propertyId') propertyId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.service.findAll(userId, role, propertyId, page, limit);
  }

  // Owner: list pending invites scoped to their properties
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get('invites')
  findInvites(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.service.findInvites(userId, role, propertyId);
  }

  // Tenant: get own profile
  @Roles(Role.TENANT)
  @Get('me')
  getMyProfile(@CurrentUser('id') userId: string) { return this.service.findByUserId(userId); }

  // Owner: get specific tenant detail (must own the property)
  @Roles(Role.SUPER_ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.service.findOne(id, userId, role);
  }
}
